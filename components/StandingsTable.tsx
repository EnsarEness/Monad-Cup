import React from 'react';
import styles from './StandingsTable.module.css';

export interface StandingsTableProps {
    groupName: string;
    standings: any[];
}

export default function StandingsTable({ groupName, standings }: StandingsTableProps) {
    return (
        <div className={`${styles.container} glass-panel`}>
            <h3 className={styles.title}>GROUP {groupName}</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th className={styles.teamCol}>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th className={styles.pts}>Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((row, idx) => (
                            <tr key={row.team_id} className={idx < 2 ? styles.advancing : ''}>
                                <td>{idx + 1}</td>
                                <td className={styles.teamCol}>{row.team?.name || 'Unknown'}</td>
                                <td>{row.played}</td>
                                <td>{row.wins}</td>
                                <td>{row.draws}</td>
                                <td>{row.losses}</td>
                                <td>{row.goals_for}</td>
                                <td>{row.goals_against}</td>
                                <td>{row.goals_for - row.goals_against}</td>
                                <td className={styles.pts}>{row.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
