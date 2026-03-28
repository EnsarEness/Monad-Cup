const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function clearDB() {
    console.log('Deleting transactions...');
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting match_events...');
    await supabase.from('match_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Deleting matches...');
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Resetting standings...');
    const { error } = await supabase.from('standings').update({
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0
    }).neq('team_id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error("Error resetting standings:", error);
    }

    console.log('Database cleared and ready for new simulations!');
}
clearDB();
