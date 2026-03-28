"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../app/page.module.css';

interface Props {
    groups: { id: string, name: string }[];
    groupMatchCount: number;
    knockoutMatchCount: number;
}

export default function SimulationButton({ groups, groupMatchCount, knockoutMatchCount }: Props) {
    const [loading, setLoading] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || '');
    const [currentMatch, setCurrentMatch] = useState('');
    const router = useRouter();
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const startPolling = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(() => {
            router.refresh();
        }, 2000);
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const handleReset = async () => {
        setResetting(true);
        setShowResetConfirm(false);
        try {
            await fetch('/api/reset', { method: 'POST' });
        } catch (err) {
            console.error('Failed to reset', err);
        }
        setResetting(false);
        router.refresh();
    };

    const handleSimulateGroup = async () => {
        if (!selectedGroup) return;
        setLoading(true);
        setCurrentMatch('Grup simülasyonu başlatılıyor...');
        startPolling();
        try {
            await fetch('/api/simulate/group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: selectedGroup }),
            });
        } catch (err) {
            console.error('Failed group', selectedGroup, err);
        }
        stopPolling();
        setLoading(false);
        setCurrentMatch('');
        router.refresh();
    };

    const handleSimulateAll = async () => {
        setGlobalLoading(true);
        setCurrentMatch('Tüm gruplar simüle ediliyor...');
        startPolling();
        try {
            await fetch('/api/simulate/all', { method: 'POST' });
        } catch (err) {
            console.error('Failed all groups', err);
        }
        stopPolling();
        setGlobalLoading(false);
        setCurrentMatch('');
        router.refresh();
    };

    const handleStartKnockout = async () => {
        setLoading(true);
        setCurrentMatch('Eleme turları hazırlanıyor...');
        try {
            const res = await fetch('/api/simulate/knockout/start', { method: 'POST' });
            const data = await res.json();
            if (data.error) alert(data.error);
        } catch (err) {
            console.error('Failed to start knockout', err);
        }
        setLoading(false);
        setCurrentMatch('');
        router.refresh();
        router.push('/knockout'); // Redirect to bracket view
    };

    const handleNextKnockoutRound = async () => {
        setLoading(true);
        setCurrentMatch('Eleme turu simüle ediliyor...');
        startPolling();
        try {
            const res = await fetch('/api/simulate/knockout/next', { method: 'POST' });
            const data = await res.json();
            if (data.error) alert(data.error);
        } catch (err) {
            console.error('Failed to simulate next round', err);
        }
        stopPolling();
        setLoading(false);
        setCurrentMatch('');
        router.refresh();
    };

    const selectedGroupName = groups.find(g => g.id === selectedGroup)?.name || '';
    const isGroupStageDone = groupMatchCount >= 72;
    const isKnockoutStarted = knockoutMatchCount > 0;

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Reset Section */}
            {!showResetConfirm ? (
                <button
                    onClick={() => setShowResetConfirm(true)}
                    disabled={resetting || loading || globalLoading}
                    className={`${styles.actionBtn} glass-panel`}
                    style={{ borderColor: '#ff4444', color: '#ff4444' }}
                >
                    🗑️ SIFIRLA
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={handleReset}
                        className={`${styles.actionBtn} glass-panel`}
                        style={{ background: '#ff4444', color: 'white', borderColor: '#ff4444' }}
                    >
                        EVET, SİL
                    </button>
                    <button
                        onClick={() => setShowResetConfirm(false)}
                        className={`${styles.actionBtn} glass-panel`}
                    >
                        VAZGEÇ
                    </button>
                </div>
            )}

            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

            {/* Knockout Controls */}
            {isGroupStageDone && !isKnockoutStarted && (
                <button
                    onClick={handleStartKnockout}
                    disabled={loading || globalLoading || resetting}
                    className={`${styles.actionBtn} glass-panel`}
                    style={{ borderColor: '#FFD700', color: '#FFD700', fontWeight: 'bold' }}
                >
                    🏆 ELEME TURLARINI BAŞLAT
                </button>
            )}

            {isKnockoutStarted && (
                <button
                    onClick={handleNextKnockoutRound}
                    disabled={loading || globalLoading || resetting}
                    className={`${styles.actionBtn} glass-panel`}
                    style={{ borderColor: '#00F0FF', color: '#00F0FF', fontWeight: 'bold' }}
                >
                    ⚽ SONRAKİ TURU OYNAT
                </button>
            )}

            {!isKnockoutStarted && (
                <>
                    {/* Global Simulation */}
                    <button
                        onClick={handleSimulateAll}
                        disabled={loading || globalLoading || resetting || isGroupStageDone}
                        className={`${styles.actionBtn} glass-panel`}
                        style={{ borderColor: 'var(--monad-purple)' }}
                    >
                        {globalLoading ? '⏳ TÜM GRUPLAR...' : '🌎 TÜM GRUPLARI BAŞLAT'}
                    </button>

                    <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

                    {/* Group Simulation */}
                    <select
                        value={selectedGroup}
                        onChange={e => setSelectedGroup(e.target.value)}
                        disabled={loading || globalLoading || isGroupStageDone}
                        className={styles.actionBtn}
                        style={{ padding: '12px', background: 'rgba(0,0,0,0.5)' }}
                    >
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSimulateGroup}
                        disabled={loading || globalLoading || !selectedGroup || isGroupStageDone}
                        className={`${styles.actionBtn} glass-panel`}
                    >
                        {loading ? `⏳ ${selectedGroupName}...` : '▶️ GRUBU BAŞLAT'}
                    </button>
                </>
            )}

            {currentMatch && (
                <span style={{ color: 'var(--neon-green, #0f0)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', animation: 'pulse 1s infinite', marginLeft: '8px' }}>
                    {currentMatch}
                </span>
            )}
        </div>
    );
}
