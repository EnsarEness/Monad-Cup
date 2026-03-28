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
    type: 'goal' | 'yellow_card' | 'red_card' | 'var_check' | 'injury' | 'save' | 'miss' | 'substitution' | 'kickoff' | 'halftime' | 'fulltime';
    teamId?: string; // Which team this event belongs to (for goals)
}

export interface MatchResult {
    scoreA: number;
    scoreB: number;
    events: MatchEventData[];
}

const EVENT_TEMPLATES = {
    goal: [
        "⚽ GOOOL! {team} ağları buluyor! (hızlı kontra atak)",
        "⚽ GOOOL! {team} uzak mesafeden muhteşem bir vuruş!",
        "⚽ GOOOL! {team} köşe vuruşundan skoru değiştiriyor!",
        "⚽ GOOOL! {team} penaltıyı gole çeviriyor!",
        "⚽ GOOOL! Savunma hatasından sonra {team} için kolay gol!",
        "⚽ GOOOL! {team} kafa vuruşuyla gol buluyor!"
    ],
    yellow_card: [
        "🟨 Sarı kart! {team} oyuncusu sert müdahale sonrası uyarıldı.",
        "🟨 Sarı kart! {team} oyuncusu hakemle tartışmaktan cezalandırıldı.",
        "🟨 Sarı kart! {team} taktiksel faulden kart gördü.",
        "🟨 Sarı kart! {team} oyuncusu zaman kaybettiği için uyarıldı."
    ],
    red_card: [
        "🟥 KIRMIZI KART! {team} tehlikeli müdahale sonrası 10 kişi kaldı!",
        "🟥 KIRMIZI KART! İkinci sarıdan kırmızı! {team} oyuncusu sahayı terk ediyor!",
        "🟥 KIRMIZI KART! {team} oyuncusu dirsek atarak ihraç edildi!"
    ],
    var_check: [
        "📺 VAR İNCELEMESİ! Hakem monitöre gidiyor... {team} pozisyonu inceleniyor.",
        "📺 VAR! Ofsayt kontrolü yapılıyor... {team} golü geçerli mi?",
        "📺 VAR İNCELEMESİ! Penaltı pozisyonu kontrol ediliyor, {team} ceza sahasında müdahale.",
        "📺 VAR KARARI: Pozisyon incelendi, oyun devam ediyor."
    ],
    injury: [
        "🚑 Oyun durdu! {team} oyuncusu yerde kaldı, sağlık ekibi sahada.",
        "🚑 Zorunlu değişiklik! {team} oyuncusu sakatlık nedeniyle oyundan çıkıyor."
    ],
    save: [
        "🧤 Harika kurtarış! {team} kalecisi müthiş refleksle topu çıkardı!",
        "🧤 İnanılmaz! {team} kalecisi topu üst direğe çeldi!",
        "🧤 Muhteşem kurtarış! {team} kalecisi takımını kurtardı!"
    ],
    miss: [
        "❌ Kaçan gol! {team} boş kaleye vuramadı!",
        "❌ Inanılmaz! {team} topu tribünlere gönderdi!",
        "❌ Direkte kaldı! {team} ne kadar şanssız!"
    ],
    substitution: [
        "🔄 Değişiklik! {team} taze kan getiriyor oyuna.",
        "🔄 Taktiksel hamle! {team} teknik direktörü değişikliğe gidiyor.",
        "🔄 Değişiklik! {team} hücum hattını güçlendiriyor."
    ]
};

function getRandomItem(arr: string[], teamName: string) {
    const item = arr[Math.floor(Math.random() * arr.length)];
    return item.replace("{team}", teamName);
}

export function simulateMatch(teamA: TeamStats, teamB: TeamStats): MatchResult {
    const strengthA = teamA.attack * 0.4 + teamA.midfield * 0.4 + teamA.defense * 0.2;
    const strengthB = teamB.attack * 0.4 + teamB.midfield * 0.4 + teamB.defense * 0.2;
    const totalStrength = strengthA + strengthB || 100;

    const lambdaA = (strengthA / totalStrength) * 3;
    const lambdaB = (strengthB / totalStrength) * 3;

    let scoreA = 0;
    let scoreB = 0;
    for (let i = 0; i < 5; i++) {
        if (Math.random() < lambdaA * 0.25) scoreA++;
        if (Math.random() < lambdaB * 0.25) scoreB++;
    }

    const events: MatchEventData[] = [];

    // 1' - Kickoff
    events.push({ minute: 1, text: "🏟️ Maç başladı! İlk düdük çaldı!", type: 'kickoff' });

    // Goal events - scattered across the match
    for (let i = 0; i < scoreA; i++) {
        const minute = Math.floor(Math.random() * 88) + 2;
        events.push({ minute, text: getRandomItem(EVENT_TEMPLATES.goal, teamA.name), type: 'goal', teamId: teamA.id });
    }
    for (let i = 0; i < scoreB; i++) {
        const minute = Math.floor(Math.random() * 88) + 2;
        events.push({ minute, text: getRandomItem(EVENT_TEMPLATES.goal, teamB.name), type: 'goal', teamId: teamB.id });
    }

    // Random other events (6-10 total non-goal events for realism)
    const nonGoalCount = Math.floor(Math.random() * 5) + 6;
    const eventTypes: (keyof typeof EVENT_TEMPLATES)[] = ['yellow_card', 'red_card', 'var_check', 'injury', 'save', 'miss', 'substitution'];
    const eventWeights = [25, 3, 12, 8, 20, 15, 17]; // probability weights

    for (let i = 0; i < nonGoalCount; i++) {
        // Weighted random selection
        const totalWeight = eventWeights.reduce((a, b) => a + b, 0);
        let rng = Math.random() * totalWeight;
        let typeIdx = 0;
        for (let w = 0; w < eventWeights.length; w++) {
            rng -= eventWeights[w];
            if (rng <= 0) { typeIdx = w; break; }
        }
        const type = eventTypes[typeIdx];
        const team = Math.random() > 0.5 ? teamA : teamB;
        const minute = Math.floor(Math.random() * 88) + 2;
        events.push({ minute, text: getRandomItem(EVENT_TEMPLATES[type], team.name), type, teamId: team.id });
    }

    // 45' - Halftime
    events.push({ minute: 45, text: "⏸️ İlk yarı sona erdi! Takımlar soyunma odasına gidiyor.", type: 'halftime' });

    // Sort all events by minute
    events.sort((a, b) => a.minute - b.minute);

    // 90' - Full time (add at end)
    events.push({ minute: 90, text: "🏁 Maç sona erdi! Final düdüğü çaldı!", type: 'fulltime' });

    return {
        scoreA,
        scoreB,
        events
    };
}
