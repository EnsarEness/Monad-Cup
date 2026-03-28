import React from 'react';
import { supabase } from '@/lib/supabase';
import BracketTree, { BracketMatch } from '@/components/BracketTree';
import styles from './knockout.module.css';
import RefreshPoller from '@/components/RefreshPoller';

export const revalidate = 0;

export default async function KnockoutPage() {
    const { data: matches } = await supabase
        .from('matches')
        .select(`
      id, 
      scoreA:scorea, 
      scoreB:scoreb,
      stage,
      status,
      teamA:teama_id ( name ),
      teamB:teamb_id ( name )
    `)
        .neq('stage', 'group')
        .order('created_at', { ascending: true });

    const bracketMatches: BracketMatch[] = [];

    if (matches) {
        matches.forEach((m: any) => {
            bracketMatches.push({
                id: m.id,
                round: m.stage,
                teamA: m.teamA ? { name: m.teamA.name, score: m.scoreA } : null,
                teamB: m.teamB ? { name: m.teamB.name, score: m.scoreB } : null,
            });
        });
    }

    return (
        <div className={styles.container}>
            <RefreshPoller isLive={bracketMatches.length > 0} />
            <h2 className={styles.title}>KNOCKOUT <span className="neon-text-purple">BRACKET</span></h2>

            {bracketMatches.length > 0 ? (
                <BracketTree matches={bracketMatches} />
            ) : (
                <div className={styles.empty}>
                    <p>Eleme aşaması henüz başlamadı.</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                        Grup aşamasını (72 maç) tamamladıktan sonra Dashboard üzerinden eleme turlarını başlatabilirsiniz.
                    </p>
                </div>
            )}
        </div>
    );
}
