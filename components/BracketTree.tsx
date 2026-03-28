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

const ROUND_NAMES: Record<string, string> = {
    'R32': 'Son 32',
    'R16': 'Son 16',
    'QF': 'Çeyrek Final',
    'SF': 'Yarı Final',
    'F': 'FİNAL'
};

export default function BracketTree({ matches }: BracketTreeProps) {
    // 1. Group matches by round and side
    const matchesByRound: Record<string, BracketMatch[]> = {
        'R32': matches.filter(m => m.round === 'R32').sort((a, b) => (a.id || '').localeCompare(b.id || '')),
        'R16': matches.filter(m => m.round === 'R16').sort((a, b) => (a.id || '').localeCompare(b.id || '')),
        'QF': matches.filter(m => m.round === 'QF').sort((a, b) => (a.id || '').localeCompare(b.id || '')),
        'SF': matches.filter(m => m.round === 'SF').sort((a, b) => (a.id || '').localeCompare(b.id || '')),
        'F': matches.filter(m => m.round === 'F'),
    };

    // 2. Classify each match to a side (left or right) based on round total count
    const getMatchSide = (m: BracketMatch): 'left' | 'right' => {
        const roundMatches = matchesByRound[m.round] || [];
        const index = roundMatches.indexOf(m);
        const half = Math.ceil(roundMatches.length / 2);
        return index < half ? 'left' : 'right';
    };

    // 3. Get matches for a specific round and side
    const getLeftMatches = (round: string) => {
        return (matchesByRound[round] || []).filter(m => getMatchSide(m) === 'left');
    };

    const getRightMatches = (round: string) => {
        return (matchesByRound[round] || []).filter(m => getMatchSide(m) === 'right');
    };

    const finalMatch = matchesByRound['F']?.[0];

    const renderMatch = (m: BracketMatch, round: string, side: 'left' | 'right') => (
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
    );

    return (
        <div className={styles.container}>
            <div className={styles.tournamentHeader}>
                <div className={styles.bracketTitle}>MONAD CUP <span className="neon-text-purple">TURKEY 2026</span></div>
            </div>

            <div className={styles.bracketWrapper}>
                {/* Left Bracket - Top Half */}
                <div className={styles.bracketSide}>
                    {['R32', 'R16', 'QF', 'SF'].map(round => (
                        <div key={`${round}-left`} className={`${styles.roundColumn} ${styles[round]}`}>
                            <h5 className={styles.roundLabel}>{ROUND_NAMES[round]}</h5>
                            <div className={styles.matches}>
                                {getLeftMatches(round).map(m => renderMatch(m, round, 'left'))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Center / Finals */}
                <div className={styles.finalsCenter}>
                    <div className={styles.finalMatchContainer}>
                        <h4 className={styles.finalLabel}>FİNAL</h4>
                        <div className={styles.trophyWrapper}>
                            <span className={styles.glowTrophy}>🏆</span>
                        </div>
                        {finalMatch ? renderMatch(finalMatch, 'F', 'left') : (
                            <div className={`${styles.matchBox} ${styles.emptyMatch} glass-panel`}>
                                <span>BEKLENİYOR...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Bracket - Bottom Half (Mirrored) */}
                <div className={`${styles.bracketSide} ${styles.mirrored}`}>
                    {['SF', 'QF', 'R16', 'R32'].map(round => (
                        <div key={`${round}-right`} className={`${styles.roundColumn} ${styles[round]}`}>
                            <h5 className={styles.roundLabel}>{ROUND_NAMES[round]}</h5>
                            <div className={styles.matches}>
                                {getRightMatches(round).map(m => renderMatch(m, round, 'right'))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
