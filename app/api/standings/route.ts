import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');

        let query = supabase
            .from('standings')
            .select(`
        *,
        team:teams ( name, flag_url ),
        group:groups ( name )
      `)
            .order('points', { ascending: false })
            .order('goals_for', { ascending: false });

        if (groupId) {
            query = query.eq('group_id', groupId);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ standings: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
