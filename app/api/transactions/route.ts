import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        event:match_events (
           minute, event_text,
           match:matches (
              teamA:teamA_id (name),
              teamB:teamB_id (name)
           )
        )
      `)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ transactions: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
