import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processGroupMatchDay } from '@/lib/simulation-logic';

export async function POST() {
    try {
        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select('id, name');

        if (groupsError || !groups) {
            return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
        }

        // To avoid API timeouts, we'll run ALL groups in parallel with a very small delay (100ms)
        // This ensures the entire simulation for 12 groups finishes within a few seconds.
        const results = await Promise.all(
            groups.map(group =>
                processGroupMatchDay(group.id, 100) // 100ms delay for global simulation
                    .catch(err => ({ error: err.message, groupId: group.id }))
            )
        );

        return NextResponse.json({ success: true, results });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
