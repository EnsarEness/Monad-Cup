import React from 'react';
import { supabase } from '@/lib/supabase';
import StandingsTable from '@/components/StandingsTable';
import styles from './groups.module.css';

export const revalidate = 0;

export default async function GroupsPage() {
    const { data: standingsData } = await supabase
        .from('standings')
        .select(`
      *,
      team:teams ( name, flag_url ),
      group:groups ( name )
    `)
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false });

    // Group the data by group_id
    const groupsConfig: Record<string, { groupName: string; standings: any[] }> = {};

    if (standingsData) {
        standingsData.forEach((row: any) => {
            const gName = row.group?.name || 'Unknown';
            if (!groupsConfig[row.group_id]) {
                groupsConfig[row.group_id] = { groupName: gName, standings: [] };
            }
            groupsConfig[row.group_id].standings.push(row);
        });
    }

    // Sort groups alphabetically by name A-L
    const sortedGroups = Object.values(groupsConfig).sort((a, b) =>
        a.groupName.localeCompare(b.groupName)
    );

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>TOURNAMENT <span className="neon-text-purple">GROUPS A-L</span></h2>
            <div className={styles.grid}>
                {sortedGroups.length > 0 ? (
                    sortedGroups.map((g) => (
                        <StandingsTable key={g.groupName} groupName={g.groupName} standings={g.standings} />
                    ))
                ) : (
                    <div className={styles.empty}>Database empty. Run simulation to generate groups.</div>
                )}
            </div>
        </div>
    );
}
