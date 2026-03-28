import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Fetch Match with teams
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select(`
        *,
        scoreA:scorea, scoreB:scoreb,
        teamA:teama_id ( id, name, flag_url ),
        teamB:teamb_id ( id, name, flag_url ),
        group:group_id ( id, name )
      `)
            .eq('id', id)
            .single();

        if (matchError || !match) {
            return NextResponse.json({ error: matchError?.message || 'Not found' }, { status: 404 });
        }

        // Fetch Events with Transactions
        const { data: events, error: eventsError } = await supabase
            .from('match_events')
            .select(`
        *,
        transaction:transactions ( tx_hash, timestamp )
      `)
            .eq('match_id', id)
            .order('minute', { ascending: true });

        return NextResponse.json({
            match,
            events: events || []
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
