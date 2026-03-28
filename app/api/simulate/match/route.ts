import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { simulateMatch, TeamStats } from '@/lib/ai-engine';
import { simulateBlockchainTx } from '@/lib/blockchain';

export async function POST(req: Request) {
    try {
        const { teamAId, teamBId, groupId } = await req.json();

        if (!teamAId || !teamBId) {
            return NextResponse.json({ error: 'Missing team IDs' }, { status: 400 });
        }

        // 1. Fetch Teams
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', [teamAId, teamBId]);

        if (teamsError || !teams || teams.length !== 2) {
            return NextResponse.json({ error: 'Teams not found' }, { status: 404 });
        }

        const teamA = teams.find(t => t.id === teamAId) as TeamStats;
        const teamB = teams.find(t => t.id === teamBId) as TeamStats;

        // 2. Simulate Match
        const { scoreA, scoreB, events } = simulateMatch(teamA, teamB);

        // 3. Save Match
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
                teama_id: teamAId,
                teamb_id: teamBId,
                group_id: groupId || null,
                scorea: scoreA,
                scoreb: scoreB,
                stage: groupId ? 'group' : 'knockout',
                status: 'COMPLETED'
            })
            .select()
            .single();

        if (matchError || !match) {
            return NextResponse.json({ error: matchError?.message }, { status: 500 });
        }

        // 4. Save Events & Simulate Blockchain in parallel
        const eventPromises = events.map(async (ev) => {
            const { data: savedEvent } = await supabase
                .from('match_events')
                .insert({
                    match_id: match.id,
                    minute: ev.minute,
                    event_text: ev.text
                })
                .select()
                .single();

            if (savedEvent) {
                // Blockchain Tx
                const tx = await simulateBlockchainTx(savedEvent.id, ev.text);
                await supabase.from('transactions').insert({
                    match_event_id: savedEvent.id,
                    tx_hash: tx.txHash,
                    timestamp: tx.timestamp
                });
                return { ...savedEvent, transaction: tx };
            }
            return null;
        });

        const savedEvents = await Promise.all(eventPromises);

        // Update standings logic could be triggered here or lazily handled

        return NextResponse.json({
            match,
            events: savedEvents.filter(Boolean)
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
