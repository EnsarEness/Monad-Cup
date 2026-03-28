import React from 'react';
import styles from './BracketTree.module.css';

export interface BracketMatch {
    id: string;
    round: string; // e.g. 'R32', 'R16', 'QF', 'SF', 'F'
    teamA: { name: string; score: number } | null;
    teamB: { name: string; score: number } | null;
}

interface BracketTreeProps {
    matches: BracketMatch[];
}

const ROUNDS = ['R32', 'R16', 'QF', 'SF', 'F'];

export default function BracketTree({ matches }: BracketTreeProps) {
    // Group matches by round
    const matchesByRound = ROUNDS.map(roundStr =>
        matches.filter(m => m.round === roundStr)
    );

    return (
        <div className={styles.container}>
            <div className={styles.bracket}>
                {ROUNDS.map((roundStr, idx) => {
                    const roundMatches = matchesByRound[idx];
                    return (
                        <div key={roundStr} className={styles.column}>
                            <h4 className={styles.roundTitle}>{roundStr}</h4>
                            <div className={styles.matchList}>
                                {roundMatches.map(m => (
                                    <div key={m.id} className={`${styles.matchBox} glass-panel`}>
                                        <div className={styles.teamRow}>
                                            <span className={styles.teamName}>{m.teamA ? m.teamA.name : 'TBD'}</span>
                                            <span className={styles.score}>{m.teamA?.score ?? '-'}</span>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div className={styles.teamRow}>
                                            <span className={styles.teamName}>{m.teamB ? m.teamB.name : 'TBD'}</span>
                                            <span className={styles.score}>{m.teamB?.score ?? '-'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
