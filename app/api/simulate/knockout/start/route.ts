import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getQualifiers, generateR32Bracket } from '@/lib/knockout';

export async function POST() {
    try {
        // 1. Check if all group matches are done (12 groups * 6 matches = 72)
        const { count, error: countError } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('stage', 'group')
            .eq('status', 'COMPLETED');

        if (countError) throw new Error('Failed to check group matches');

        // In some cases, we might want to start early, but the rule is 72 matches for 12 groups.
        if ((count ?? 0) < 72) {
            return NextResponse.json({ error: `Grup aşaması henüz bitmedi! (${count ?? 0}/72 maç tamamlandı)` }, { status: 400 });
        }

        // 2. Check if R32 already started
        const { data: existingR32 } = await supabase
            .from('matches')
            .select('id')
            .eq('stage', 'R32')
            .limit(1);

        if (existingR32 && existingR32.length > 0) {
            return NextResponse.json({ error: 'Son 32 turu zaten başlatılmış!' }, { status: 400 });
        }

        // 3. Get Qualifiers
        const qualifiers = await getQualifiers();
        if (qualifiers.length !== 32) {
            return NextResponse.json({ error: `Kalifikasyon hatası: ${qualifiers.length}/32 takım seçilebildi.` }, { status: 500 });
        }

        // 4. Generate Bracket
        const bracketMatches = await generateR32Bracket(qualifiers);

        // 5. Insert R32 matches
        const insertPromises = bracketMatches.map(m =>
            supabase.from('matches').insert({
                teama_id: m.teamA_id,
                teamb_id: m.teamB_id,
                stage: 'R32',
                status: 'PLANNED', // or PENDING
                scorea: 0,
                scoreb: 0
                // group_id is null for knockout
            })
        );

        await Promise.all(insertPromises);

        return NextResponse.json({ success: true, message: 'Son 32 turu başarıyla başlatıldı!' });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
