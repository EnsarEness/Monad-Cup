"use client";

import React, { useEffect, useRef } from 'react';
import styles from './EventFeed.module.css';

export interface EventFeedProps {
    events: { minute: number; event_text?: string; text?: string; id: string }[];
}

function getEventStyle(text: string): string {
    if (text.includes('⚽')) return styles.goalEvent;
    if (text.includes('🟨')) return styles.yellowEvent;
    if (text.includes('🟥')) return styles.redEvent;
    if (text.includes('📺')) return styles.varEvent;
    if (text.includes('🚑')) return styles.injuryEvent;
    if (text.includes('🧤')) return styles.saveEvent;
    if (text.includes('❌')) return styles.missEvent;
    if (text.includes('🔄')) return styles.subEvent;
    if (text.includes('🏟️') || text.includes('⏸️') || text.includes('🏁')) return styles.matchEvent;
    return '';
}

export default function EventFeed({ events }: EventFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <div className={`${styles.container} glass-panel`}>
            <div className={styles.header}>
                <h3>LIVE TERMINAL FEED</h3>
                <span className={styles.blinkingCursor}>_</span>
            </div>

            <div className={styles.feed} ref={scrollRef}>
                {events.length === 0 ? (
                    <div className={styles.empty}>Maç olayları bekleniyor...</div>
                ) : (
                    events.map((ev, i) => {
                        const eventText = ev.event_text || ev.text || '';
                        return (
                            <div key={ev.id || i} className={`${styles.eventRow} ${getEventStyle(eventText)}`}>
                                <div className={styles.minute}>[{ev.minute}&apos;]</div>
                                <div className={styles.text}>{eventText}</div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
