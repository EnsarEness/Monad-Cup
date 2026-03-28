import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('match_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        await supabase.from('standings').update({
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0
        }).neq('team_id', '00000000-0000-0000-0000-000000000000');

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
