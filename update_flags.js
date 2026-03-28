const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Country name -> ISO 3166-1 alpha-2 code mapping
const countryCodeMap = {
    "Mexico": "mx",
    "South Africa": "za",
    "South Korea": "kr",
    "Denmark": "dk",
    "Canada": "ca",
    "Italy": "it",
    "Qatar": "qa",
    "Switzerland": "ch",
    "Brazil": "br",
    "Morocco": "ma",
    "Haiti": "ht",
    "Scotland": "gb-sct",
    "USA": "us",
    "Paraguay": "py",
    "Australia": "au",
    "Turkey": "tr",
    "Germany": "de",
    "Curacao": "cw",
    "Ivory Coast": "ci",
    "Ecuador": "ec",
    "Netherlands": "nl",
    "Japan": "jp",
    "Ukraine": "ua",
    "Tunisia": "tn",
    "Belgium": "be",
    "Egypt": "eg",
    "Iran": "ir",
    "New Zealand": "nz",
    "Spain": "es",
    "Cape Verde": "cv",
    "Saudi Arabia": "sa",
    "Uruguay": "uy",
    "France": "fr",
    "Senegal": "sn",
    "Poland": "pl",
    "Norway": "no",
    "Argentina": "ar",
    "Algeria": "dz",
    "Austria": "at",
    "Jordan": "jo",
    "Portugal": "pt",
    "Sweden": "se",
    "Uzbekistan": "uz",
    "Colombia": "co",
    "England": "gb-eng",
    "Croatia": "hr",
    "Ghana": "gh",
    "Panama": "pa"
};

async function updateFlags() {
    for (const [name, code] of Object.entries(countryCodeMap)) {
        const flagUrl = `https://flagcdn.com/w80/${code}.png`;
        const { error } = await supabase.from('teams').update({ flag_url: flagUrl }).eq('name', name);
        if (error) {
            console.error(`Error updating ${name}:`, error.message);
        } else {
            console.log(`✓ ${name} → ${flagUrl}`);
        }
    }
    console.log('\nAll flags updated!');
}

updateFlags();
