import React from 'react';
import { supabase } from '@/lib/supabase';
import styles from './explorer.module.css';

export const revalidate = 0;

export default async function ExplorerPage() {
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
      id, tx_hash, timestamp,
      event:match_events (
        minute, event_text,
        match:matches (
          teamA:teama_id ( name ),
          teamB:teamb_id ( name )
        )
      )
    `)
        .order('timestamp', { ascending: false })
        .limit(100);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>MONAD BLOCKCHAIN <span className="neon-text-green">EXPLORER</span></h2>

            <div className={`${styles.tableWrapper} glass-panel`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tx Hash</th>
                            <th>Match</th>
                            <th>Minute</th>
                            <th>Event Summary</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!transactions || transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.empty}>No transactions on the ledger.</td>
                            </tr>
                        ) : (
                            transactions.map(_tx => {
                                const tx = _tx as any;
                                const teamA = tx.event?.match?.teamA?.name || 'Unknown';
                                const teamB = tx.event?.match?.teamB?.name || 'Unknown';
                                return (
                                    <tr key={tx.id}>
                                        <td className={styles.txHashCell}>
                                            <span className={styles.txHash}>{tx.tx_hash}</span>
                                        </td>
                                        <td className={styles.matchCell}>{teamA} vs {teamB}</td>
                                        <td className={styles.minCell}>{tx.event?.minute}'</td>
                                        <td className={styles.eventCell}>{tx.event?.event_text}</td>
                                        <td className={styles.timeCell}>{new Date(tx.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
