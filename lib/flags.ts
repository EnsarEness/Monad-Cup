// Ülke adına göre bayrak emoji döndürür
const FLAGS: Record<string, string> = {
    // A-Z common countries for World Cup
    'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Angola': '🇦🇴',
    'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Belgium': '🇧🇪',
    'Bolivia': '🇧🇴', 'Bosnia': '🇧🇦', 'Brazil': '🇧🇷', 'Cameroon': '🇨🇲',
    'Canada': '🇨🇦', 'Chile': '🇨🇱', 'China': '🇨🇳', 'Colombia': '🇨🇴',
    'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷', 'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿',
    'Denmark': '🇩🇰', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Ethiopia': '🇪🇹', 'Finland': '🇫🇮', 'France': '🇫🇷', 'Germany': '🇩🇪',
    'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Guinea': '🇬🇳', 'Honduras': '🇭🇳',
    'Hungary': '🇭🇺', 'Iceland': '🇮🇸', 'India': '🇮🇳', 'Indonesia': '🇮🇩',
    'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ireland': '🇮🇪', 'Israel': '🇮🇱',
    'Italy': '🇮🇹', 'Ivory Coast': '🇨🇮', "Côte d'Ivoire": '🇨🇮',
    'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kenya': '🇰🇪',
    'Kuwait': '🇰🇼', 'Libya': '🇱🇾', 'Mali': '🇲🇱', 'Mexico': '🇲🇽',
    'Morocco': '🇲🇦', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Nigeria': '🇳🇬',
    'North Korea': '🇰🇵', 'Norway': '🇳🇴', 'Oman': '🇴🇲', 'Panama': '🇵🇦',
    'Paraguay': '🇵🇾', 'Peru': '🇵🇪', 'Poland': '🇵🇱', 'Portugal': '🇵🇹',
    'Qatar': '🇶🇦', 'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Saudi Arabia': '🇸🇦',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Spain': '🇪🇸',
    'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾', 'Thailand': '🇹🇭',
    'Trinidad and Tobago': '🇹🇹', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷', 'Türkiye': '🇹🇷',
    'UAE': '🇦🇪', 'Ukraine': '🇺🇦', 'Uruguay': '🇺🇾', 'USA': '🇺🇸',
    'United States': '🇺🇸', 'Venezuela': '🇻🇪', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'Zimbabwe': '🇿🇼',
};

export function getFlagEmoji(teamName: string): string {
    // Direct match
    if (FLAGS[teamName]) return FLAGS[teamName];
    // Partial match
    const lower = teamName.toLowerCase();
    for (const [key, emoji] of Object.entries(FLAGS)) {
        if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
            return emoji;
        }
    }
    return '🌍';
}
