import React from 'react';
import { supabase } from '@/lib/supabase';
import MatchCard from '@/components/MatchCard';
import SimulationButton from '@/components/SimulationButton';
import styles from './page.module.css';

import Link from 'next/link';

// Force dynamic rendering and no caching to ensure the limit is respected
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
    const { groupId } = await searchParams;
    const { data: groups } = await supabase.from('groups').select('id, name').order('name');

    let query = supabase
        .from('matches')
        .select(`
      id, scoreA:scorea, scoreB:scoreb, status,
      teamA:teama_id ( name, flag_url ),
      teamB:teamb_id ( name, flag_url )
    `)
        .order('created_at', { ascending: false });

    if (groupId) {
        query = query.eq('group_id', groupId);
    } else {
        query = query.limit(48); // Show more matches (e.g., 48 = 24 matches * 2 teams or just a lot of games)
    }

    const { count: groupMatchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'group')
        .eq('status', 'COMPLETED');

    const { count: knockoutMatchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .neq('stage', 'group');

    const { data: matches } = await query;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>LIVE TERMINAL / <span className="neon-text-purple">RECENT MATCHES</span></h2>
                <div className={styles.actions}>
                    <SimulationButton
                        groups={groups || []}
                        groupMatchCount={groupMatchCount || 0}
                        knockoutMatchCount={knockoutMatchCount || 0}
                    />
                </div>
            </header>

            <div className={styles.groupFilterRow}>
                <Link href="/" className={`${styles.filterBtn} ${!groupId ? styles.activeFilter : ''}`}>Recent</Link>
                {groups?.map(g => (
                    <Link key={g.id} href={`/?groupId=${g.id}`} className={`${styles.filterBtn} ${groupId === g.id ? styles.activeFilter : ''}`}>
                        {g.name}
                    </Link>
                ))}
            </div>

            <div className={styles.grid}>
                {matches && matches.length > 0 ? (
                    matches.map((m: any) => (
                        <MatchCard
                            key={m.id}
                            id={m.id}
                            teamA={m.teamA}
                            teamB={m.teamB}
                            scoreA={m.scoreA}
                            scoreB={m.scoreB}
                            status={m.status}
                        />
                    ))
                ) : (
                    <div className={styles.empty}>No matches simulated yet.</div>
                )}
            </div>
        </div>
    );
}
