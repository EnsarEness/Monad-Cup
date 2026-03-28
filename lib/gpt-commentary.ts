// Using OpenAI API for realistic match commentary
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o'; // Latest GPT-4o model (2026 updated)

// 2026 World Cup Active Squad Players - For authentic goal descriptions
const TEAM_SQUADS: Record<string, string[]> = {
          'Turkey': ['Arda Güler', 'Kerem Aktürkoğlu', 'Serdar Dursun', 'Orkun Kökçü', 'Merih Demiral', 'Ozan Kabak', 'Hakan Çalhanoğlu', 'Çağlar Söyüncü', 'Altay Bayındır'],
          'Spain': ['Jude Bellingham', 'Pedri', 'Alejandro Balde', 'Ferran Torres', 'Álvaro Morata', 'Carlos Soler', 'Sergio Busquets', 'Unai Simón'],
          'France': ['Kylian Mbappé', 'Aurélien Tchouaméni', 'Eduardo Camavinga', 'Toni Kroos', 'Dayot Upamecano', 'Adrien Rabiot', 'Ibrahima Konaté', 'Mike Maignan'],
          'England': ['Harry Kane', 'Phil Foden', 'Jude Bellingham', 'Bukayo Saka', 'Declan Rice', 'Luke Shaw', 'Mason Mount', 'Jordan Pickford'],
          'Germany': ['Jamal Musiala', 'Florian Wirtz', 'Kai Havertz', 'Serge Gnabry', 'Thomas Müller', 'Mats Hummels', 'Manuel Neuer', 'Antonio Rüdiger'],
          'Italy': ['Lautaro Martínez', 'Federico Chiesa', 'Marco Verratti', 'Alessandro Bastoni', 'Matteo Darmian', 'Gianluigi Donnarumma', 'Gianluca Scamacca', 'Nicolò Barella'],
          'Portugal': ['Bruno Fernandes', 'Cristiano Ronaldo', 'João Félix', 'Rúben Dias', 'João Palhinha', 'Nélson Semedo', 'Pepe', 'José Sá'],
          'Argentina': ['Lionel Messi', 'Julián Álvarez', 'Alejandro Garnacho', 'Enzo Fernández', 'Lisandro Martínez', 'Nicolás González', 'Gonzalo Montiel', 'Franco Armani'],
          'Brazil': ['Vinícius Júnior', 'Neymar Jr', 'Rodrygo', 'Gabriel Jesus', 'Lucas Paquetá', 'Thiago Silva', 'Marquinhos', 'Alison'],
          'Netherlands': ['Frenkie de Jong', 'Cody Gakpo', 'Memphis Depay', 'Virgil van Dijk', 'Matthijs de Ligt', 'Denzel Dumfries', 'Steven Bergwijn', 'Remko Pasveer'],
          'Uruguay': ['Darwin Núñez', 'Luis Suárez', 'Giorgian de Arrascaeta', 'Nicolás De La Cruz', 'Ronald Araújo', 'Diego Godín', 'Sergio Rochet', 'Marko Milic'],
          'Mexico': ['Hirving Lozano', 'Raúl Jiménez', 'Alexis Vega', 'Javier Chicharito', 'Edson Álvarez', 'Jorge Sánchez', 'Guillermo Ochoa', 'Héctor Moreno'],
          'Belgium': ['Kevin De Bruyne', 'Eden Hazard', 'Michy Batshuayi', 'Yannick Carrasco', 'Axel Witsel', 'Toby Alderweireld', 'Thibaut Courtois', 'Jan Vertonghen'],
          'South Korea': ['Son Heung-min', 'Hwang Hee-chan', 'Lee Kang-in', 'Kim Min-jae', 'Ki Sung-yueng', 'Jeong Woo-yeong', 'Kim Seung-gyu', 'Oh Se-hun'],
          'Egypt': ['Mohamed Salah', 'Mohamed Elneny', 'Trezeguet', 'Ahmed Refaat', 'Amr El Sulaya', 'Ali Maaloul', 'Mahmoud El-Wensh', 'Karim El Kady'],
          'Japan': ['Takefusa Kubo', 'Kaoru Mitoma', 'Daichi Kamada', 'Hiroki Ito', 'Maya Yoshida', 'Shuichi Gonda', 'Ritsu Doan', 'Ayase Ueda'],
          'Ecuador': ['Enner Valencia', 'Moisés Caicedo', 'Ángel Mena', 'Piero Hincapié', 'Byron Castillo', 'Pervis Estupiñán', 'Pedro Ortiz', 'Gonzalo Plata'],
          'Colombia': ['Luis Díaz', 'Duván Zapata', 'James Rodríguez', 'Alfredo Morelos', 'Davinson Sánchez', 'David Ospina', 'Juan Cuadrado', 'Wilmar Barrios'],
          'Poland': ['Robert Lewandowski', 'Piotr Zieliński', 'Arkadiusz Milik', 'Kamil Grosicki', 'Jan Bednarek', 'Bartosz Bereszyński', 'Łukasz Fabiański', 'Grzegorz Krychowiak'],
          'USA': ['Christian Pulisic', 'Weston McKennie', 'Sergiño Dest', 'Tyler Adams', 'Antonee Robinson', 'Joe Scally', 'Matt Turner', 'Yunus Musah'],
          'Canada': ['Alphonso Davies', 'Jonathan David', 'Cyle Larin', 'Athanasios Rantos', 'Tajon Buchanan', 'Joe Paul', 'Milan Borjan', 'Sam Adekugbe'],
          'Australia': ['Socceroo', 'Craig Goodwin', 'Harry Souttar', 'Mathew Ryan', 'Aziz Behich', 'Kye Rowles', 'Ajdin Hrustic', 'Martin Boyle'],
          'Costa Rica': ['Álvaro Zamora', 'Bryan Ruiz', 'Anthony Contreras', 'Joel Campbell', 'Keylor Navas', 'Oscar Duarte', 'Kendall Waston', 'Cristian Gamboa'],
          'Morocco': ['Hakim Ziyech', 'Noussair Mazraoui', 'Achraf Hakimi', 'Romain Saïss', 'Sofyan Amrabat', 'Yassine Bounou', 'Ilias Chair', 'Nayef Aguerd'],
          'Tunisia': ['Youssef Msakni', 'Wahbi Khazri', 'Naïm Sliti', 'Hamdi Naguez', 'Ali Maaloul', 'Anis Ben Slimane', 'Ben Mohamed', 'Gianluigi Donnarumma'],
          'Saudi Arabia': ['Salem Al-Dawsari', 'Cristiano Ronaldo', 'Salman Al-Faraj', 'Mohammed Al-Burayk', 'Nacho Fernández', 'Hassan Al-Tamari', 'Ali Al-Jubair', 'Abdullah Al-Mayouf'],
          'Iran': ['Alireza Jahanbakhsh', 'Sardar Azmoun', 'Ramin Rezaeian', 'Necip Uysal', 'Rouzbeh Cheshmi', 'Vahid Amiri', 'Majid Hosseini', 'Persepolis Star'],
          'Nigeria': ['Victor Osimhen', 'Ahmed Musa', 'Moses Simon', 'Alex Iwobi', 'Wilfred Ndidi', 'William Ekong', 'Tyrone Ebuehi', 'Maduka Okoye'],
          'Cameroon': ['Eric Maxim Choupo-Moting', 'Stéphane Bahoken', 'Jean-Armel Kana-Biyik', 'André Onana', 'Yaya Banana', 'Aurélien Tchouaméni', 'Rigobert Song', 'Vincent Aboubakar'],
          'Ghana': ['Iñaki Williams', 'Mohammed Mubarik Kudus', 'André Ayew', 'Talismán Ablade', 'Daniel Afriyie Owusu', 'Kasim Adams', 'Sellas Tetteh', 'Ati-Zigi'],
          'Senegal': ['Sadio Mané', 'Idrissa Gana Gueye', 'Aliou Cissé', 'Youssouf Sabaly', 'Kalidou Koulibaly', 'Édouard Mendy', 'Ismaïla Sarr', 'Cheikhouna Ndiaye'],
          'Croatia': ['Luka Modrić', 'Ivan Perišić', 'Mateo Kovačić', 'Dejan Lovren', 'Domagoj Vida', 'Sergej Milinković-Savić', 'Dominik Livaković', 'Josip Sutalo'],
          'Serbia': ['Sergej Milinković-Savić', 'Aleksandar Mitrović', 'Dusan Vlahović', 'Nemanja Matić', 'Marco Grujić', 'Nikola Milenkovic', 'Filip Kostić', 'Vladan Milojević'],
          'Switzerland': ['Xherdan Shaqiri', 'Granit Xhaka', 'Manuel Akanji', 'Yann Sommer', 'Denis Zakaria', 'Ricardo Rodríguez', 'Loïc Meillard', 'Steven Zuber'],
          'Denmark': ['Pierre-Emile Höjbjerg', 'Christian Eriksen', 'Rasmus Hojlund', 'Kasper Schmeichel', 'Andreas Christensen', 'Victor Nelsson', 'Morten Hjulmand', 'Jannik Vestergaard'],
          'Austria': ['David Alaba', 'Christoph Baumgartner', 'Marcel Sabitzer', 'Konrad Laimer', 'Sasa Kalajdzic', 'Stefan Posch', 'Philipp Hosiner', 'Patrick Wimmer'],
          'Czech Republic': ['Vladimir Smicer', 'Patrik Schick', 'Alex Král', 'Ondrej Celustka', 'Jakub Brabec', 'Tomás Souček', 'Petr Chavez', 'Tomáš Vaclík'],
          'Slovakia': ['Mak Juráš', 'Luboš Kamenický', 'Škrtel Martin', 'Peter Pekarík', 'Milan Škrtel', 'Vladimír Duda', 'Róbert Mak', 'Peter Čech'],
          'Romania': ['George Pușcaș', 'Vlad Chiricheș', 'Nicolae Stanciu', 'Radu Drăgușin', 'Dennis Man', 'Octavian Popescu', 'Florin Niță', 'Mihai Popescu'],
          'Greece': ['Dimitris Limnios', 'Sokratis Papastathopoulos', 'Papastathopoulos', 'Giorgos Makaridis', 'Kostas Mitroglou', 'Salvatore Sirigu', 'Otavio', 'Theofanis Gekas'],
          'Ukraine': ['Andriy Yarmolenko', 'Roman Yaremchuk', 'Oleksandr Zinchenko', 'Serhiy Sydorchuk', 'Vitaliy Mykolenko', 'Anatoliy Trubin', 'Mykhailo Mudryk', 'Ruslan Malinovskyi'],
          'Hungary': ['Dominik Szoboszlai', 'Tamás Kádár', 'Attila Szalai', 'Zoltán Stieber', 'Willi Orbán', 'Roland Sallai', 'Péter Gulácsi', 'Gergő Lovrencsics'],
          'Peru': ['Gianluca Lapadula', 'Jefferson Farfán', 'André Carrillo', 'Paolo Guerrero', 'Luis Advincula', 'Carlos Zambrano', 'Pedro Gallese', 'Yoshimar Yotún'],
          'Paraguay': ['Roque Santa Cruz', 'Miguel Almirón', 'Julio Enciso', 'Gustavo Gómez', 'Antonio Sanabria', 'Ivan Piris', 'Dani Alves', 'Silvio Gonga'],
          'Bolivia': ['Jaime Moreno', 'Ronald Raldes', 'Yony González', 'Erwin Saavedra', 'Arquímedes Ordóñez', 'Ramiro', 'Héctor Spinoza', 'García Flores'],
          'Panama': ['Édgar Bárcenas', 'Gabriel Gómez', 'Cristián Martínez', 'Jaime Penedo', 'Abdiel Ayarza', 'Daniel Muñoz', 'Fredy Montero', 'Rolando Blackburn'],
          'Venezuela': ['Jefferson Martínez', 'Jon Aramburu', 'Rómulo Otero', 'Arquímedes Ordóñez', 'Salomón Rondón', 'Rafael Márquez', 'Iñaki Godoy', 'Weverton'],
          'Chile': ['Alexis Sánchez', 'Eduardo Vargas', 'Darío Osorio', 'Claudio Bravo', 'Guillermo Maripán', 'Pablo Puyol', 'Erick Pulgar', 'Marcelo Díaz'],
          'Honduras': ['Alberth Elis', 'Édgar Benítez', 'Romell Quioto', 'Juan Carlos Obregón', 'Osael Romero', 'Andy Najar', 'Romain Saïss', 'José Bodipo'],
          'Jamaica': ['Darren Moore', 'Bobby Reid', 'Shamar Nicholson', 'Kemar Lawrence', 'Javain Brown', 'Rechel Lyons', 'Oniel Fisher', 'Damion Lowe'],
          'Ukraine XI': ['Victor Osimhen', 'Andriy Yarmolenko', 'Roman Yaremchuk', 'Vitaliy Mykolenko', 'Anatoliy Trubin', 'Oleksandr Zinchenko', 'Serhiy Sydorchuk', 'Ruslan Malinovskyi'],
          'Uzbekistan': ['Igor Sergeev', 'Jaloliddin Mashaliyev', 'Eldor Shomurodov', 'Korabayev', 'Sh. Abdullayev', 'Navbahor Khodjaev', 'Markovic Boris', 'Sergei Kirov'],
          'Morocco XI': ['Noussair Mazraoui', 'Achraf Hakimi', 'Hakim Ziyech', 'Sofyan Amrabat', 'Yassine Bounou', 'Romain Saïss', 'Ilias Chair', 'Nayef Aguerd'],
          'Tajikistan': ['Igor Sergeev', 'Vadim Evtushok', 'Parviz', 'Sergei Pushkin', 'Khodjaev Navbahor', 'Boris Markovic', 'Urunov Shokir', 'Zainudin Ibragimov'],
          'Albania': ['Armando Broja', 'Elseid Hysaj', 'Berat Djimsiti', 'Niko Gega', 'Odise Roshi', 'Thomas Strakosha', 'Xeka', 'Sokol Cikalleshi'],
          'Georgia': ['Khvicha Kvaratskhelia', 'Giorgi Kvekveskiri', 'Otar Kakabadze', 'Guram Kashia', 'Anzor Mevlidze', 'Giorgi Gvelesiani', 'Giorgi Mamardashvili', 'Vardo Azemi'],
          'Kosovo': ['Edin Dzeko', 'Valon Berisha', 'Vedat Muriqi', 'Amir Rrahmani', 'Darios Kusuvalić', 'Lorik Cana', 'Gzim Memushaj', 'Ibrahimaj Florian'],
          'Kyrgyzstan': ['Mirlan Murzaev', 'Maksat Rozikov', 'Talaibek Tagaziev', 'Edil Baltaev', 'Dženan Radončić', 'Ramzidin Gadzhibekov', 'Aleksandr Kokorin', 'Konstantin Paramonov'],
};

export interface GoalEvent {
          minute: number;
          scorer: string;
          assist?: string;
          goalType: string; // 'Shot', 'Header', 'Penalty', 'OwnGoal', 'FollowUp'
          description: string;
          teamName: string;
}

export interface MatchNarrative {
          matchSummary: string;
          goals: GoalEvent[];
          keyMoments: string[];
}

async function generateRealisticGoalDescription(
          teamName: string,
          scorerName: string,
          minute: number,
          goalType: string,
          opponentName: string
): Promise<{ description: string; goalType: string; assist?: string }> {
          if (!OPENAI_API_KEY) {
                    // Fallback if no API key
                    return generateFallbackDescription(teamName, scorerName, minute, goalType);
          }

          try {
                    // Get squad players for this team (for authentic goal descriptions)
                    const squadPlayers = TEAM_SQUADS[teamName] || ['Player'];
                    const playersJson = JSON.stringify(squadPlayers);

                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                              method: 'POST',
                              headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                              },
                              body: JSON.stringify({
                                        model: OPENAI_MODEL,
                                        messages: [
                                                  {
                                                            role: 'system',
                                                            content: `You are a professional football (soccer) commentator. Generate VERY realistic and exciting match commentary in Turkish. Be specific about technique, positioning, and emotion. Keep response under 100 words. IMPORTANT: Always use one of the provided player names from the squad. Format: "⚽ [Goal type]! [Description]. Scorer: [Player name]. Minute: [minute]"`,
                                                  },
                                                  {
                                                            role: 'user',
                                                            content: `${teamName} goal against ${opponentName} via ${goalType} in minute ${minute}.

Scorer: ${scorerName}

Make exciting, realistic Turkish commentary about this goal. Include the player name, goal technique, and the minute.`,
                                                  },
                                        ],
                                        temperature: 0.8,
                                        max_tokens: 150,
                              }),
                    });

                    const data = await response.json();

                    if (data.choices && data.choices[0]) {
                              const text = data.choices[0].message.content;
                              return {
                                        description: text,
                                        goalType: goalType,
                                        assist: Math.random() > 0.4 ? (TEAM_SQUADS[teamName]?.[Math.floor(Math.random() * (TEAM_SQUADS[teamName]?.length || 1))] || 'Player') : undefined,
                              };
                    }
          } catch (error) {
                    console.error('GPT API error:', error);
          }

          return generateFallbackDescription(teamName, scorerName, minute, goalType);
}

function generateFallbackDescription(
          teamName: string,
          scorerName: string,
          minute: number,
          goalType: string
): { description: string; goalType: string; assist?: string } {
          const descriptions: Record<string, string[]> = {
                    Shot: [
                              `Harika bir şut! ${scorerName} uzak mesafeden ağları buluyor!`,
                              `${scorerName} penalti alanının dışından müthiş bir vuruş yaptı!`,
                              `Zor açıdan aldığı topu ${scorerName} köşeye gönderdi!`,
                    ],
                    Header: [
                              `${scorerName} kafa vuruşuyla gol! Köşe vuruşundan güzel bir finali!`,
                              `Havai topla ${scorerName} başıyla takımını öne geçiriyor!`,
                              `Kafa golu! ${scorerName} bek olmasına rağmen harika bir pozisyonda baş attı!`,
                    ],
                    Penalty: [
                              `Penalti! ${scorerName} soğukkanlılıkla kaleyi bulmuş!`,
                              `Penalti vuruşu ve gol! ${scorerName} sakin kalp ile kaleyi kandırıyor!`,
                    ],
                    FollowUp: [
                              `Karışık olaylar sonrası ${scorerName} ceza sahasında topu yakalayıp gole çeviriyor!`,
                              `${scorerName} ribaund'dan faydalanarak skoru değiştiriyor!`,
                    ],
                    OwnGoal: [
                              `Kendi kalesi! Savunma hatası ve ${scorerName} istemeyerek takımına karşı gol!`,
                    ],
          };

          const typeDescriptions = descriptions[goalType] || descriptions['Shot'];
          const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];

          return {
                    description: `⚽ ${description} (Dakika ${minute})`,
                    goalType: goalType,
                    assist: Math.random() > 0.5 ? (TEAM_SQUADS[teamName]?.[Math.floor(Math.random() * (TEAM_SQUADS[teamName]?.length || 1))] || 'Player') : undefined,
          };
}

export async function generateMatchGoals(
          teamA: string,
          teamB: string,
          scoreA: number,
          scoreB: number
): Promise<GoalEvent[]> {
          const goals: GoalEvent[] = [];
          const goalTypes = ['Shot', 'Header', 'Penalty', 'FollowUp'];

          // Generate goals for Team A
          for (let i = 0; i < scoreA; i++) {
                    const minute = Math.floor(Math.random() * 85) + 5; // Realistic minutes 5-90
                    const squadPlayersA = TEAM_SQUADS[teamA] || ['Player'];
                    const scorer = squadPlayersA[Math.floor(Math.random() * squadPlayersA.length)];
                    const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)];

                    const { description, assist } = await generateRealisticGoalDescription(
                              teamA,
                              scorer,
                              minute,
                              goalType,
                              teamB
                    );

                    goals.push({
                              minute,
                              scorer,
                              assist,
                              goalType,
                              description,
                              teamName: teamA,
                    });
          }

          // Generate goals for Team B
          for (let i = 0; i < scoreB; i++) {
                    const minute = Math.floor(Math.random() * 85) + 5;
                    const squadPlayersB = TEAM_SQUADS[teamB] || ['Player'];
                    const scorer = squadPlayersB[Math.floor(Math.random() * squadPlayersB.length)];
                    const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)];

                    const { description, assist } = await generateRealisticGoalDescription(
                              teamB,
                              scorer,
                              minute,
                              goalType,
                              teamA
                    );

                    goals.push({
                              minute,
                              scorer,
                              assist,
                              goalType,
                              description,
                              teamName: teamB,
                    });
          }

          // Sort by minute
          return goals.sort((a, b) => a.minute - b.minute);
}

export async function generateMatchSummary(
          teamA: string,
          teamB: string,
          scoreA: number,
          scoreB: number,
          goals: GoalEvent[]
): Promise<string> {
          if (!OPENAI_API_KEY) {
                    return `${teamA} ${scoreA}-${scoreB} ${teamB} (Eğlenceli maç)`;
          }

          try {
                    const goalSummary = goals
                              .map(g => `${g.minute}' ${g.scorer} (${g.goalType})`)
                              .join(', ');

                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                              method: 'POST',
                              headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                              },
                              body: JSON.stringify({
                                        model: OPENAI_MODEL,
                                        messages: [
                                                  {
                                                            role: 'system',
                                                            content: `You are a sports journalist. Write a SHORT (2-3 sentences) Turkish match summary. Be exciting but concise.`,
                                                  },
                                                  {
                                                            role: 'user',
                                                            content: `${teamA} vs ${teamB}: ${scoreA}-${scoreB}. Goals: ${goalSummary}. Summary in Turkish.`,
                                                  },
                                        ],
                                        temperature: 0.9,
                                        max_tokens: 200,
                              }),
                    });

                    const data = await response.json();
                    if (data.choices && data.choices[0]) {
                              return data.choices[0].message.content;
                    }
          } catch (error) {
                    console.error('Summary generation error:', error);
          }

          return `${teamA} ${scoreA}-${scoreB} ${teamB} - Heyecanlı maç!`;
}
