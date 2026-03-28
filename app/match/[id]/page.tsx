import React from 'react';
import { supabase } from '@/lib/supabase';
import MatchCard from '@/components/MatchCard';
import EventFeed from '@/components/EventFeed';
import RefreshPoller from '@/components/RefreshPoller';
import styles from './match.module.css';

export const revalidate = 0;

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: matchData } = await supabase
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

    const { data: eventsData } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', id)
        .order('minute', { ascending: true });

    if (!matchData) {
        return <div className={styles.container}>Match not found</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <MatchCard
                    id={matchData.id}
                    teamA={matchData.teamA}
                    teamB={matchData.teamB}
                    scoreA={matchData.scoreA}
                    scoreB={matchData.scoreB}
                    status={matchData.status}
                />
            </div>

            <div className={styles.feedContainer}>
                <RefreshPoller isLive={matchData.status === 'IN_PROGRESS'} />
                <EventFeed events={eventsData || []} />
            </div>
        </div>
    );
}
