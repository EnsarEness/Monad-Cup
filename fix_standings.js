const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixStandings() {
    const { data: matches, error: mErr } = await supabase.from('matches')
        .select('id, teamA_id:teama_id, teamB_id:teamb_id, scoreA:scorea, scoreB:scoreb, group_id, status')
        .eq('status', 'COMPLETED');

    if (mErr) console.error(mErr);
    if (!matches || matches.length === 0) return console.log('No matches to fix.');

    const standings = {};

    matches.forEach(m => {
        if (!m.group_id) return;

        if (!standings[m.teamA_id]) {
            standings[m.teamA_id] = { team_id: m.teamA_id, group_id: m.group_id, played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 };
        }
        if (!standings[m.teamB_id]) {
            standings[m.teamB_id] = { team_id: m.teamB_id, group_id: m.group_id, played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 };
        }

        const sA = standings[m.teamA_id];
        const sB = standings[m.teamB_id];

        sA.played++;
        sB.played++;
        sA.goals_for += m.scoreA;
        sA.goals_against += m.scoreB;
        sB.goals_for += m.scoreB;
        sB.goals_against += m.scoreA;

        if (m.scoreA > m.scoreB) {
            sA.wins++;
            sA.points += 3;
            sB.losses++;
        }
        else if (m.scoreB > m.scoreA) {
            sB.wins++;
            sB.points += 3;
            sA.losses++;
        }
        else {
            sA.draws++;
            sB.draws++;
            sA.points += 1;
            sB.points += 1;
        }
    });

    const promises = Object.values(standings).map(async (s) => {
        const { error } = await supabase.from('standings').update({
            played: s.played,
            wins: s.wins,
            draws: s.draws,
            losses: s.losses,
            goals_for: s.goals_for,
            goals_against: s.goals_against,
            points: s.points
        }).eq('team_id', s.team_id).eq('group_id', s.group_id);
        if (error) console.error("Error updating", s.team_id, error.message);
    });

    await Promise.all(promises);
    console.log('Retroactively fixed standings for', Object.keys(standings).length, 'teams based on', matches.length, 'matches!');
}
fixStandings();
