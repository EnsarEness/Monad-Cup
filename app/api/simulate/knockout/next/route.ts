import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { simulateKnockoutMatch, TeamStats } from '@/lib/ai-engine';
import { simulateBlockchainTx } from '@/lib/blockchain';

export async function POST() {
    try {
        // 1. Identify the current stage to play
        const stages = ['R32', 'R16', 'QF', 'SF', 'F', '3RD_PLACE'];
        let currentStage = '';

        for (const stage of stages) {
            const { count } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .eq('stage', stage)
                .eq('status', 'PLANNED');

            if (count && count > 0) {
                currentStage = stage;
                break;
            }
        }

        if (!currentStage) {
            return NextResponse.json({ error: 'Tamamlanacak aktif bir eleme turu bulunamadı.' }, { status: 400 });
        }

        // 2. Fetch matches for current stage
        const { data: matches } = await supabase
            .from('matches')
            .select(`*, teamA:teama_id(*), teamB:teamb_id(*)`)
            .eq('stage', currentStage)
            .eq('status', 'PLANNED')
            .order('created_at', { ascending: true });

        if (!matches || matches.length === 0) {
            return NextResponse.json({ error: 'Maçlar bulunamadı.' }, { status: 500 });
        }

        const winners: string[] = [];

        // 3. Simulate matches (using batching or parallel for now)
        // Note: For live feed, we'd stagger them, but here we'll process them to get winners.
        const processPromises = matches.map(async (m) => {
            const res = await simulateKnockoutMatch(m.teamA as TeamStats, m.teamB as TeamStats);
            const winner_id = (res.penaltyScoreA !== undefined && res.penaltyScoreB !== undefined)
                ? (res.penaltyScoreA > res.penaltyScoreB ? m.teama_id : m.teamb_id)
                : (res.scoreA > res.scoreB ? m.teama_id : m.teamb_id);

            winners.push(winner_id);

            // Update match status and score
            await supabase.from('matches').update({
                scorea: res.scoreA,
                scoreb: res.scoreB,
                winner_id: winner_id,
                status: 'COMPLETED'
            }).eq('id', m.id);

            // Insert events and tx
            for (const ev of res.events) {
                const { data: savedEvent } = await supabase
                    .from('match_events')
                    .insert({
                        match_id: m.id,
                        minute: ev.minute,
                        event_text: ev.text
                    })
                    .select().single();

                if (savedEvent) {
                    const tx = await simulateBlockchainTx(savedEvent.id, ev.text);
                    await supabase.from('transactions').insert({
                        match_event_id: savedEvent.id,
                        tx_hash: tx.txHash,
                        timestamp: tx.timestamp
                    });
                }
            }
            return { id: m.id, winner_id };
        });

        await Promise.all(processPromises);

        // 4. Generate next stage if applicable
        const nextStageIdx = stages.indexOf(currentStage);
        if (nextStageIdx < 4) { // Up to SF -> Final
            const nextStage = stages[nextStageIdx + 1];
            // Pair winners [0,1], [2,3]...
            const nextMatches = [];
            for (let i = 0; i < winners.length; i += 2) {
                if (winners[i + 1]) {
                    nextMatches.push({
                        teama_id: winners[i],
                        teamb_id: winners[i + 1],
                        stage: nextStage,
                        status: 'PLANNED',
                        scorea: 0,
                        scoreb: 0
                    });
                }
            }
            if (nextMatches.length > 0) {
                await supabase.from('matches').insert(nextMatches);
            }
        }

        return NextResponse.json({ success: true, stage: currentStage, winners_count: winners.length });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
