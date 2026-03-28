import React from 'react';
import Link from 'next/link';
import styles from './MatchCard.module.css';

export interface MatchProps {
    id: string;
    teamA: { name: string; flag_url?: string | null };
    teamB: { name: string; flag_url?: string | null };
    scoreA: number;
    scoreB: number;
    status: string;
}

// Country name -> ISO code fallback for flag CDN
const COUNTRY_CODES: Record<string, string> = {
    "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Denmark": "dk",
    "Canada": "ca", "Italy": "it", "Qatar": "qa", "Switzerland": "ch",
    "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
    "USA": "us", "Paraguay": "py", "Australia": "au", "Turkey": "tr",
    "Germany": "de", "Curacao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
    "Netherlands": "nl", "Japan": "jp", "Ukraine": "ua", "Tunisia": "tn",
    "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
    "Spain": "es", "Cape Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
    "France": "fr", "Senegal": "sn", "Poland": "pl", "Norway": "no",
    "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
    "Portugal": "pt", "Sweden": "se", "Uzbekistan": "uz", "Colombia": "co",
    "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa"
};

function getFlagUrl(team: { name: string; flag_url?: string | null }): string {
    if (team.flag_url) return team.flag_url;
    const code = COUNTRY_CODES[team.name];
    if (code) return `https://flagcdn.com/w80/${code}.png`;
    return '';
}

export default function MatchCard({ id, teamA, teamB, scoreA, scoreB, status }: MatchProps) {
    const flagA = getFlagUrl(teamA);
    const flagB = getFlagUrl(teamB);

    return (
        <Link href={`/match/${id}`} className={`${styles.card} glass-panel`}>
            <div className={styles.status}>
                {status === 'IN_PROGRESS' && <span className={styles.liveIndicator}></span>}
                <span className={status === 'IN_PROGRESS' ? 'neon-text-green' : 'neon-text-purple'}>
                    {status === 'IN_PROGRESS' ? 'LIVE' : status}
                </span>
            </div>

            <div className={styles.teamsContainer}>
                <div className={styles.team}>
                    {flagA ? (
                        <img src={flagA} alt={teamA.name} className={styles.flag} />
                    ) : (
                        <div className={styles.flagPlaceholder} />
                    )}
                    <span className={styles.teamName}>{teamA.name}</span>
                </div>

                <div className={styles.scoreBlock}>
                    <span className={styles.score}>{scoreA}</span>
                    <span className={styles.divider}>-</span>
                    <span className={styles.score}>{scoreB}</span>
                </div>

                <div className={styles.team}>
                    {flagB ? (
                        <img src={flagB} alt={teamB.name} className={styles.flag} />
                    ) : (
                        <div className={styles.flagPlaceholder} />
                    )}
                    <span className={styles.teamName}>{teamB.name}</span>
                </div>
            </div>

            <div className={styles.txInfo}>
                <span className={styles.txIcon}>⛓️</span> Verified on Monad
            </div>
        </Link>
    );
}
