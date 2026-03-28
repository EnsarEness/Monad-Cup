import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Önce maçları çek
        const { data: matches, error } = await supabase
            .from('matches')
            .select('id, status, scorea, scoreb, teama_id, teamb_id, group_id, stage')
            .eq('stage', 'group')
            .order('id', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!matches || matches.length === 0) {
            return NextResponse.json({ matches: [] });
        }

        // Takım ve grup bilgilerini ayrı çek
        const teamIds = [...new Set([
            ...matches.map(m => m.teama_id),
            ...matches.map(m => m.teamb_id),
        ])];
        const groupIds = [...new Set(matches.map(m => m.group_id).filter(Boolean))];

        const [teamsRes, groupsRes] = await Promise.all([
            supabase.from('teams').select('id, name, flag_url').in('id', teamIds),
            supabase.from('groups').select('id, name').in('id', groupIds),
        ]);

        const teamsMap: Record<string, any> = {};
        (teamsRes.data || []).forEach(t => { teamsMap[t.id] = t; });

        const groupsMap: Record<string, any> = {};
        (groupsRes.data || []).forEach(g => { groupsMap[g.id] = g; });

        const enriched = matches.map(m => ({
            id: m.id,
            status: m.status,
            scorea: m.scorea,
            scoreb: m.scoreb,
            teamA: teamsMap[m.teama_id] || { id: m.teama_id, name: 'Bilinmiyor', flag_url: '?' },
            teamB: teamsMap[m.teamb_id] || { id: m.teamb_id, name: 'Bilinmiyor', flag_url: '?' },
            group: groupsMap[m.group_id] || { id: m.group_id, name: '?' },
        }));

        return NextResponse.json({ matches: enriched });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
