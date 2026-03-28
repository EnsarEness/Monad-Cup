import { supabase } from '@/lib/supabase';
import { calculateStandings } from './tournament';

export interface Qualifier {
    team_id: string;
    group_id: string;
    rank: number; // 1, 2, or 3
    points: number;
    goals_for: number;
    goals_against: number;
    goal_diff: number;
}

export async function getQualifiers(): Promise<Qualifier[]> {
    const { data: standings, error } = await supabase
        .from('standings')
        .select(`*, team:teams(name)`)
        .order('group_id');

    if (error || !standings) throw new Error('Failed to fetch standings');

    const groups: Record<string, any[]> = {};
    standings.forEach(s => {
        if (!groups[s.group_id]) groups[s.group_id] = [];
        groups[s.group_id].push({
            ...s,
            goal_diff: s.goals_for - s.goals_against
        });
    });

    const winners: Qualifier[] = [];
    const runnersUp: Qualifier[] = [];
    const thirdPlaces: Qualifier[] = [];

    Object.keys(groups).forEach(groupId => {
        const sorted = groups[groupId].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
            return b.goals_for - a.goals_for;
        });

        winners.push({ team_id: sorted[0].team_id, group_id: groupId, rank: 1, points: sorted[0].points, goals_for: sorted[0].goals_for, goals_against: sorted[0].goals_against, goal_diff: sorted[0].goal_diff });
        runnersUp.push({ team_id: sorted[1].team_id, group_id: groupId, rank: 2, points: sorted[1].points, goals_for: sorted[1].goals_for, goals_against: sorted[1].goals_against, goal_diff: sorted[1].goal_diff });
        thirdPlaces.push({ team_id: sorted[2].team_id, group_id: groupId, rank: 3, points: sorted[2].points, goals_for: sorted[2].goals_for, goals_against: sorted[2].goals_against, goal_diff: sorted[2].goal_diff });
    });

    // Pick top 8 third-place teams
    const bestThirds = thirdPlaces
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
            return b.goals_for - a.goals_for;
        })
        .slice(0, 8);

    return [...winners, ...runnersUp, ...bestThirds];
}

export async function generateR32Bracket(qualifiers: Qualifier[]) {
    // Shuffle or sort to create matches
    // Rule: Same group protection. 1st vs 3rd or 1st vs 2nd.

    const firsts = qualifiers.filter(q => q.rank === 1);
    const seconds = qualifiers.filter(q => q.rank === 2);
    const thirds = qualifiers.filter(q => q.rank === 3);

    const poolA = [...firsts]; // 12 teams
    const poolB = [...seconds, ...thirds]; // 12 + 8 = 20 teams

    const matches: { teamA_id: string, teamB_id: string }[] = [];

    // Simple matching logic: 
    // We have 32 teams total -> 16 matches.
    // Pool A (12) and 4 from Pool B will be "seeds" maybe? 
    // Let's just do a simple shuffle and check for group protection.

    const allTeams = [...qualifiers];
    const used = new Set<string>();

    // This is a naive matching for demo purposes
    // In a real tournament, this is a fixed tree.
    for (let i = 0; i < allTeams.length; i++) {
        if (used.has(allTeams[i].team_id)) continue;

        for (let j = i + 1; j < allTeams.length; j++) {
            if (used.has(allTeams[j].team_id)) continue;

            // Group protection
            if (allTeams[i].group_id !== allTeams[j].group_id) {
                matches.push({ teamA_id: allTeams[i].team_id, teamB_id: allTeams[j].team_id });
                used.add(allTeams[i].team_id);
                used.add(allTeams[j].team_id);
                break;
            }
        }
    }

    return matches;
}
