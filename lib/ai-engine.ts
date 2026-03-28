import { generateMatchGoals, generateMatchSummary } from './gpt-commentary';

// Team strength calculation (replaces getTeamStrength from player-database)
function getTeamStrength(attack: number, defense: number, midfield: number): number {
    return attack * 0.5 + defense * 0.3 + midfield * 0.2;
}

export interface TeamStats {
    id: string;
    name: string;
    attack: number;
    defense: number;
    midfield: number;
    rating: number;
}

export interface MatchEventData {
    minute: number;
    text: string;
    type: 'goal' | 'yellow_card' | 'red_card' | 'var_check' | 'injury' | 'save' | 'miss' | 'substitution' | 'kickoff' | 'halftime' | 'fulltime' | 'penalty_shootout';
    teamId?: string; // Which team this event belongs to (for goals)
    playerName?: string; // Player who scored
    goalType?: string; // Type of goal
    assist?: string; // Player who assisted
}

export interface MatchResult {
    scoreA: number;
    scoreB: number;
    penaltyScoreA?: number;
    penaltyScoreB?: number;
    events: MatchEventData[];
}

export async function simulateMatch(teamA: TeamStats, teamB: TeamStats): Promise<MatchResult> {
    // Calculate realistic team strengths
    const strengthA = getTeamStrength(teamA.attack, teamA.defense, teamA.midfield);
    const strengthB = getTeamStrength(teamB.attack, teamB.defense, teamB.midfield);
    const totalStrength = strengthA + strengthB || 1;

    // Poisson distribution for goals (more realistic than random binary)
    const probA = strengthA / totalStrength;
    const probB = strengthB / totalStrength;

    // Average goals per team based on strength
    const expectedGoalsA = probA * 2.5;  // Average 2.5 goals total distributed by strength
    const expectedGoalsB = probB * 2.5;

    let scoreA = 0;
    let scoreB = 0;

    // Simulate goals using Poisson-like logic
    for (let i = 0; i < 5; i++) {
        if (Math.random() < expectedGoalsA * 0.25) scoreA++;
        if (Math.random() < expectedGoalsB * 0.25) scoreB++;
    }

    // Cap scores at realistic values
    scoreA = Math.min(scoreA, 6);
    scoreB = Math.min(scoreB, 6);

    // Generate realistic goal descriptions using GPT
    let goals = await generateMatchGoals(teamA.name, teamB.name, scoreA, scoreB);
    let matchSummary = await generateMatchSummary(teamA.name, teamB.name, scoreA, scoreB, goals);

    const events: MatchEventData[] = [];

    // 1' - Kickoff
    events.push({
        minute: 1,
        text: "🏟️ Maç başladı! İlk düdük çaldı!",
        type: 'kickoff'
    });

    // Goal events - using GPT-generated realistic descriptions
    for (const goal of goals) {
        const teamId = goal.teamName === teamA.name ? teamA.id : teamB.id;
        events.push({
            minute: goal.minute,
            text: goal.description,
            type: 'goal',
            teamId: teamId,
            playerName: goal.scorer,
            goalType: goal.goalType,
            assist: goal.assist
        });
    }

    // Random other events
    const nonGoalCount = Math.floor(Math.random() * 4) + 3;
    const eventTemplates = [
        `🟨 Sarı kart! {team} oyuncusu sert müdahale sonrası uyarıldı.`,
        `🧤 Harika kurtarış! {team} kalecisi müthiş refleksle topu çıkardı!`,
        `❌ Kaçan gol! {team} boş kaleye vuramadı!`,
        `🔄 Değişiklik! {team} taze kan getiriyor oyuna.`,
    ];

    for (let i = 0; i < nonGoalCount; i++) {
        const team = Math.random() > 0.5 ? teamA : teamB;
        const minute = Math.floor(Math.random() * 88) + 2;
        const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
        const text = template.replace('{team}', team.name);

        events.push({
            minute,
            text,
            type: 'yellow_card',
            teamId: team.id
        });
    }

    // 45' - Halftime
    events.push({
        minute: 45,
        text: "⏸️ İlk yarı sona erdi! Takımlar soyunma odasına gidiyor.",
        type: 'halftime'
    });

    // Sort all events by minute
    events.sort((a, b) => a.minute - b.minute);

    // 90' - Full time
    events.push({
        minute: 90,
        text: "🏁 Maç sona erdi! Final düdüğü çaldı!",
        type: 'fulltime'
    });

    return { scoreA, scoreB, events };
}

export async function simulateKnockoutMatch(teamA: TeamStats, teamB: TeamStats): Promise<MatchResult> {
    const result = await simulateMatch(teamA, teamB);

    if (result.scoreA === result.scoreB) {
        // Penalty shootout
        result.events.push({ minute: 120, text: "⚖️ Beraberlik bozulmadı, seri penaltı atışlarına geçiliyor!", type: 'penalty_shootout' });

        let pA = 0;
        let pB = 0;
        let rounds = 0;

        // Perform at least 5 rounds
        while (rounds < 5 || pA === pB) {
            rounds++;
            // Team A takes penalty
            if (Math.random() > 0.3) {
                pA++;
                result.events.push({ minute: 120 + rounds, text: `🎯 GOOOL! ${teamA.name} penaltıyı gole çevirdi! (${pA}-${pB})`, type: 'penalty_shootout', teamId: teamA.id });
            } else {
                result.events.push({ minute: 120 + rounds, text: `🎯 KAÇTI! ${teamA.name} penaltı vuruşundan yararlanamadı!`, type: 'penalty_shootout', teamId: teamA.id });
            }

            // Team B takes penalty
            if (Math.random() > 0.3) {
                pB++;
                result.events.push({ minute: 120 + rounds, text: `🎯 GOOOL! ${teamB.name} penaltıyı gole çevirdi! (${pA}-${pB})`, type: 'penalty_shootout', teamId: teamB.id });
            } else {
                result.events.push({ minute: 120 + rounds, text: `🎯 KAÇTI! ${teamB.name} penaltı vuruşundan yararlanamadı!`, type: 'penalty_shootout', teamId: teamB.id });
            }

            // Sudden death check after 5 rounds
            if (rounds >= 5 && pA !== pB) break;
        }

        result.penaltyScoreA = pA;
        result.penaltyScoreB = pB;
        result.events.push({ minute: 130, text: `🏁 Seri penaltı atışları sona erdi! Kazanan: ${pA > pB ? teamA.name : teamB.name}`, type: 'penalty_shootout' });
    }

    return result;
}
