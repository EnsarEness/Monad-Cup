export interface StandingRecord {
    team_id: string;
    group_id: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    points: number;
}

/**
 * Recalculate standings based on matches.
 */
export function calculateStandings(matches: any[]): Record<string, StandingRecord> {
    const standings: Record<string, StandingRecord> = {};

    matches.forEach(m => {
        if (m.status !== 'COMPLETED') return;

        if (!standings[m.teamA_id]) {
            standings[m.teamA_id] = { team_id: m.teamA_id, group_id: m.group_id, played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 };
        }
        if (!standings[m.teamB_id]) {
            standings[m.teamB_id] = { team_id: m.teamB_id, group_id: m.group_id, played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 };
        }

        const sA = standings[m.teamA_id];
        const sB = standings[m.teamB_id];

        sA.played++;
        sB.played++;
        sA.goals_for += m.scoreA;
        sA.goals_against += m.scoreB;
        sB.goals_for += m.scoreB;
        sB.goals_against += m.scoreA;

        if (m.scoreA > m.scoreB) {
            sA.wins++;
            sA.points += 3;
            sB.losses++;
        } else if (m.scoreB > m.scoreA) {
            sB.wins++;
            sB.points += 3;
            sA.losses++;
        } else {
            sA.draws++;
            sB.draws++;
            sA.points += 1;
            sB.points += 1;
        }
    });

    return standings;
}

export function sortGroupStandings(standings: StandingRecord[]): StandingRecord[] {
    return standings.sort((a, b) => {
        // 1. Points
        if (b.points !== a.points) return b.points - a.points;
        // 2. Goal Difference
        const gdA = a.goals_for - a.goals_against;
        const gdB = b.goals_for - b.goals_against;
        if (gdB !== gdA) return gdB - gdA;
        // 3. Goals Scored
        return b.goals_for - a.goals_for;
    });
}

/**
 * Select the advancing teams: Top 2 from each group + 8 best 3rd placed.
 * Groups are A-L (12 groups).
 */
export function selectAdvancingTeams(allStandings: StandingRecord[]): string[] {
    const mapByGroup: Record<string, StandingRecord[]> = {};
    allStandings.forEach(s => {
        if (!mapByGroup[s.group_id]) mapByGroup[s.group_id] = [];
        mapByGroup[s.group_id].push(s);
    });

    const advancingIds: string[] = [];
    const thirdPlacedIds: StandingRecord[] = [];

    for (const groupId in mapByGroup) {
        const sorted = sortGroupStandings(mapByGroup[groupId]);
        if (sorted[0]) advancingIds.push(sorted[0].team_id);
        if (sorted[1]) advancingIds.push(sorted[1].team_id);
        if (sorted[2]) thirdPlacedIds.push(sorted[2]);
    }

    // Sort best 3rd placed teams
    const bestThird = sortGroupStandings(thirdPlacedIds).slice(0, 8);
    bestThird.forEach(s => advancingIds.push(s.team_id));

    // 12*2 = 24 + 8 = 32 teams total.
    return advancingIds;
}
