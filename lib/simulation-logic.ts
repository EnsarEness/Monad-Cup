import { supabase } from '@/lib/supabase';
import { simulateMatch, TeamStats } from '@/lib/ai-engine';
import { calculateStandings } from '@/lib/tournament';
import { simulateBlockchainTx } from '@/lib/blockchain';

export async function processGroupMatchDay(groupId: string, delayMs: number = 2000) {
    const { data: teams, error: teamsError } = await supabase
        .from('standings')
        .select(`team_id, team:teams(*)`)
        .eq('group_id', groupId);

    if (teamsError || !teams || teams.length !== 4) {
        throw new Error(`Group ${groupId} must have 4 teams initialized`);
    }

    const { data: existingMatches } = await supabase
        .from('matches')
        .select('id, teama_id, teamb_id')
        .eq('group_id', groupId)
        .eq('stage', 'group');

    const playedPairs = new Set<string>();
    if (existingMatches) {
        if (existingMatches.length >= 6) {
            return { skipped: true, reason: 'Tüm maçlar tamamlandı' };
        }
        existingMatches.forEach(m => {
            const key = [m.teama_id, m.teamb_id].sort().join('|');
            playedPairs.add(key);
        });
    }

    const groupTeams = teams.map(t => t.team as any as TeamStats);
    const matchDays: [number, number][][] = [
        [[0, 1], [2, 3]],
        [[0, 2], [1, 3]],
        [[0, 3], [1, 2]]
    ];

    const matchups: [TeamStats, TeamStats][] = [];
    for (const day of matchDays) {
        const dayMatchups: [TeamStats, TeamStats][] = [];
        let allUnplayed = true;
        for (const [a, b] of day) {
            const pairKey = [groupTeams[a].id, groupTeams[b].id].sort().join('|');
            if (playedPairs.has(pairKey)) {
                allUnplayed = false;
            } else {
                dayMatchups.push([groupTeams[a], groupTeams[b]]);
            }
        }
        if (dayMatchups.length > 0 && allUnplayed) {
            matchups.push(...dayMatchups);
            break;
        }
    }

    if (matchups.length === 0) {
        return { skipped: true, reason: 'Maç günü bulunamadı' };
    }

    async function processMatch(teamA: TeamStats, teamB: TeamStats) {
        const { scoreA, scoreB, events } = await simulateMatch(teamA, teamB);
        let liveScoreA = 0;
        let liveScoreB = 0;

        const { data: match } = await supabase
            .from('matches')
            .insert({
                teama_id: teamA.id,
                teamb_id: teamB.id,
                group_id: groupId,
                scorea: 0,
                scoreb: 0,
                stage: 'group',
                status: 'IN_PROGRESS'
            })
            .select()
            .single();

        if (!match) return null;

        for (const ev of events) {
            if (ev.type === 'goal') {
                if (ev.teamId === teamA.id) liveScoreA++;
                else if (ev.teamId === teamB.id) liveScoreB++;
                await supabase.from('matches').update({
                    scorea: liveScoreA,
                    scoreb: liveScoreB,
                }).eq('id', match.id);
            }

            const { data: savedEvent } = await supabase
                .from('match_events')
                .insert({ match_id: match.id, minute: ev.minute, event_text: ev.text })
                .select()
                .single();

            if (savedEvent) {
                const tx = await simulateBlockchainTx(savedEvent.id, ev.text);
                await supabase.from('transactions').insert({
                    match_event_id: savedEvent.id,
                    tx_hash: tx.txHash,
                    timestamp: tx.timestamp
                });
            }
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        await supabase.from('matches').update({ status: 'COMPLETED' }).eq('id', match.id);
        return { match, events };
    }

    const matchPromises = matchups.map(([teamA, teamB]) => processMatch(teamA, teamB));
    const results = await Promise.all(matchPromises);

    // Standings calculation
    const { data: allGroupMatches } = await supabase
        .from('matches')
        .select('id, teamA_id:teama_id, teamB_id:teamb_id, scoreA:scorea, scoreB:scoreb, group_id, status')
        .eq('group_id', groupId)
        .eq('status', 'COMPLETED');

    if (allGroupMatches) {
        const newStandings = calculateStandings(allGroupMatches);
        const standingsPromises = Object.values(newStandings).map(async (s) => {
            await supabase.from('standings').update({
                played: s.played,
                wins: s.wins,
                draws: s.draws,
                losses: s.losses,
                goals_for: s.goals_for,
                goals_against: s.goals_against,
                points: s.points
            }).eq('team_id', s.team_id).eq('group_id', groupId);
        });
        await Promise.all(standingsPromises);
    }

    return { success: true, results: results.filter(Boolean) };
}
