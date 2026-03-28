import { NextResponse } from 'next/server';
import { processGroupMatchDay } from '@/lib/simulation-logic';

export async function POST(req: Request) {
    try {
        const { groupId } = await req.json();
        if (!groupId) return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });

        const result = await processGroupMatchDay(groupId);
        if ('skipped' in result) {
            return NextResponse.json({ error: result.reason }, { status: 400 });
        }

        return NextResponse.json({ success: true, results: result.results });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
