import React from 'react';
import { supabase } from '@/lib/supabase';
import BracketTree, { BracketMatch } from '@/components/BracketTree';
import styles from './knockout.module.css';

export const revalidate = 0;

export default async function KnockoutPage() {
    const { data: matches } = await supabase
        .from('matches')
        .select(`
      id, scoreA:scorea, scoreB:scoreb,
      teamA:teama_id ( name ),
      teamB:teamb_id ( name )
    `)
        .is('group_id', null)
        .order('created_at', { ascending: true });

    // Map flat matches array into BracketMatches.
    // We'll mock the round assignments for simulation since we don't store rounds directly in the simple schema
    const bracketMatches: BracketMatch[] = [];

    if (matches) {
        matches.forEach((_m, i) => {
            const m = _m as any;
            let roundStr = 'R32';
            if (i >= 16) roundStr = 'R16';
            if (i >= 24) roundStr = 'QF';
            if (i >= 28) roundStr = 'SF';
            if (i >= 30) roundStr = 'F';

            bracketMatches.push({
                id: m.id,
                round: roundStr,
                teamA: m.teamA ? { name: m.teamA.name, score: m.scoreA } : null,
                teamB: m.teamB ? { name: m.teamB.name, score: m.scoreB } : null,
            });
        });
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>KNOCKOUT <span className="neon-text-purple">BRACKET</span></h2>
            {bracketMatches.length > 0 ? (
                <BracketTree matches={bracketMatches} />
            ) : (
                <div className={styles.empty}>Knockout stage has not begun.</div>
            )}
        </div>
    );
}
