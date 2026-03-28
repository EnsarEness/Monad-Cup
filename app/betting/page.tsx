'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/lib/context/Web3Context';
import { ethers } from 'ethers';
import styles from './betting.module.css';
import { getFlagEmoji } from '@/lib/flags';

interface Team {
    id: string;
    name: string;
    flag_url: string;
}

interface Match {
    id: string;
    status: string;
    scorea: number | null;
    scoreb: number | null;
    teamA: Team;
    teamB: Team;
    group: { id: string; name: string };
}

interface Bet {
    matchId: string;
    team: string;
    teamName: string;
    amount: string;
    txHash: string;
    timestamp: number;
}

export default function BettingPage() {
    const { account, isConnected, connectWallet, provider } = useWeb3();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [bets, setBets] = useState<Bet[]>([]);
    const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
    const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>({});
    const [pendingTx, setPendingTx] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [groupFilter, setGroupFilter] = useState<string>('ALL');

    // Load matches
    useEffect(() => {
        fetch('/api/matches/group')
            .then(r => r.json())
            .then(d => { setMatches(d.matches || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Load bets from localStorage
    useEffect(() => {
        if (account) {
            const stored = localStorage.getItem(`bets_${account}`);
            if (stored) setBets(JSON.parse(stored));
        }
    }, [account]);

    const saveBets = (newBets: Bet[]) => {
        setBets(newBets);
        if (account) localStorage.setItem(`bets_${account}`, JSON.stringify(newBets));
    };

    const placeBet = async (match: Match) => {
        setError(null);
        const team = selectedTeams[match.id];
        const amount = betAmounts[match.id];

        if (!isConnected) { await connectWallet(); return; }
        if (!team) { setError('Lütfen bir takım seçin.'); return; }
        if (!amount || parseFloat(amount) <= 0) { setError('Geçerli bir miktar girin.'); return; }

        try {
            setPendingTx(match.id);
            const signer = await (provider as any).getSigner();

            // Send MON to a treasury/pool address (or contract if deployed)
            const treasuryAddress = process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS || account!;
            const tx = await signer.sendTransaction({
                to: treasuryAddress,
                value: ethers.parseEther(amount),
            });

            const receipt = await tx.wait();
            const teamName = team === match.teamA.id ? match.teamA.name : match.teamB.name;

            const newBet: Bet = {
                matchId: match.id,
                team,
                teamName,
                amount,
                txHash: receipt.hash,
                timestamp: Date.now(),
            };
            saveBets([...bets, newBet]);

            // Reset form
            setSelectedTeams(prev => ({ ...prev, [match.id]: '' }));
            setBetAmounts(prev => ({ ...prev, [match.id]: '' }));
        } catch (err: any) {
            setError(err.message || 'İşlem başarısız.');
        } finally {
            setPendingTx(null);
        }
    };

    // Unique groups
    const groups = ['ALL', ...Array.from(new Set(matches.map(m => m.group?.name).filter(Boolean))).sort()];
    const filtered = groupFilter === 'ALL' ? matches : matches.filter(m => m.group?.name === groupFilter);

    if (loading) return (
        <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Maçlar yükleniyor...</span>
        </div>
    );

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>BETTING <span className={styles.accent}>ARENA</span></h2>

            {!isConnected && (
                <div className={styles.connectBanner}>
                    <span>🔗 Bahis yapmak için cüzdanınızı bağlayın</span>
                    <button onClick={connectWallet} className={styles.connectBtn}>Cüzdanı Bağla</button>
                </div>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}

            {/* Group Filter */}
            <div className={styles.filterBar}>
                {groups.map(g => (
                    <button
                        key={g}
                        onClick={() => setGroupFilter(g)}
                        className={`${styles.filterBtn} ${groupFilter === g ? styles.filterActive : ''}`}
                    >
                        {g}
                    </button>
                ))}
            </div>

            {/* Matches Grid */}
            <div className={styles.matchesGrid}>
                {filtered.length === 0 && (
                    <div className={styles.empty}>Henüz grup maçı yok. Simülasyonu başlatın.</div>
                )}
                {filtered.map(match => {
                    const myBet = bets.find(b => b.matchId === match.id);
                    const isFinished = match.status === 'completed' || match.status === 'finished';
                    const isPending = pendingTx === match.id;

                    return (
                        <div key={match.id} className={`${styles.matchCard} ${isFinished ? styles.finished : ''}`}>
                            <div className={styles.groupBadge}>Grup {match.group?.name}</div>

                            {/* Teams */}
                            <div className={styles.teamsRow}>
                                <button
                                    className={`${styles.teamBtn} ${selectedTeams[match.id] === match.teamA.id ? styles.teamSelected : ''}`}
                                    onClick={() => !myBet && !isFinished && setSelectedTeams(prev => ({ ...prev, [match.id]: match.teamA.id }))}
                                    disabled={!!myBet || isFinished}
                                >
                                    <div className={styles.flagContainer}>
                                        {match.teamA.flag_url ? (
                                            <img src={match.teamA.flag_url} alt={match.teamA.name} className={styles.flagImg} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        ) : null}
                                        <span className={styles.flagEmoji}>{getFlagEmoji(match.teamA.name)}</span>
                                    </div>
                                    <span className={styles.teamName}>{match.teamA.name}</span>
                                </button>

                                <div className={styles.scoreBox}>
                                    {isFinished ? (
                                        <span className={styles.score}>{match.scorea ?? 0} – {match.scoreb ?? 0}</span>
                                    ) : (
                                        <span className={styles.vs}>VS</span>
                                    )}
                                </div>

                                <button
                                    className={`${styles.teamBtn} ${selectedTeams[match.id] === match.teamB.id ? styles.teamSelected : ''}`}
                                    onClick={() => !myBet && !isFinished && setSelectedTeams(prev => ({ ...prev, [match.id]: match.teamB.id }))}
                                    disabled={!!myBet || isFinished}
                                >
                                    <div className={styles.flagContainer}>
                                        {match.teamB.flag_url ? (
                                            <img src={match.teamB.flag_url} alt={match.teamB.name} className={styles.flagImg} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        ) : null}
                                        <span className={styles.flagEmoji}>{getFlagEmoji(match.teamB.name)}</span>
                                    </div>
                                    <span className={styles.teamName}>{match.teamB.name}</span>
                                </button>
                            </div>

                            {/* Bet Form */}
                            {!myBet && !isFinished && isConnected && (
                                <div className={styles.betForm}>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="MON miktarı"
                                        value={betAmounts[match.id] || ''}
                                        onChange={e => setBetAmounts(prev => ({ ...prev, [match.id]: e.target.value }))}
                                        className={styles.amountInput}
                                    />
                                    <button
                                        onClick={() => placeBet(match)}
                                        disabled={isPending || !selectedTeams[match.id]}
                                        className={styles.betBtn}
                                    >
                                        {isPending ? '⏳ İşleniyor...' : '🎲 Bahis Yap'}
                                    </button>
                                </div>
                            )}

                            {/* Already bet */}
                            {myBet && (
                                <div className={styles.myBet}>
                                    ✅ <strong>{myBet.teamName}</strong> için <strong>{myBet.amount} MON</strong> bahis yaptın
                                    <a
                                        href={`https://testnet.monadexplorer.com/tx/${myBet.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.txLink}
                                    >
                                        TX görüntüle →
                                    </a>
                                </div>
                            )}

                            {isFinished && !myBet && (
                                <div className={styles.finishedBadge}>Maç sona erdi</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* My Bets History */}
            {bets.length > 0 && (
                <div className={styles.myBetsSection}>
                    <h3 className={styles.sectionTitle}>📋 Bahislerim</h3>
                    <div className={styles.betsList}>
                        {bets.map((bet, i) => {
                            const match = matches.find(m => m.id === bet.matchId);
                            return (
                                <div key={i} className={styles.betRow}>
                                    <span className={styles.betMatch}>
                                        {match ? `${match.teamA.name} vs ${match.teamB.name}` : `Maç #${bet.matchId}`}
                                    </span>
                                    <span className={styles.betTeam}>🎯 {bet.teamName}</span>
                                    <span className={styles.betAmount}>{bet.amount} MON</span>
                                    <a
                                        href={`https://testnet.monadexplorer.com/tx/${bet.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.txLink}
                                    >
                                        TX →
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
