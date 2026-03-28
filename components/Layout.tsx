import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Activity, Trophy, Network, LayoutDashboard, Search } from 'lucide-react';
import styles from './Layout.module.css';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} glass-panel`}>
                <div className={styles.logoContainer}>
                    <Network className="neon-text-purple" size={32} />
                    <h1 className={styles.logoText}>
                        AI <span className="neon-text-purple">MONAD</span> CUP
                    </h1>
                </div>

                <nav className={styles.nav}>
                    <Link href="/" className={styles.navLink}>
                        <LayoutDashboard size={20} />
                        <span>Terminal</span>
                    </Link>
                    <Link href="/groups" className={styles.navLink}>
                        <Activity size={20} />
                        <span>Groups A-L</span>
                    </Link>
                    <Link href="/knockout" className={styles.navLink}>
                        <Trophy size={20} />
                        <span>Knockout</span>
                    </Link>
                    <Link href="/explorer" className={styles.navLink}>
                        <Search size={20} />
                        <span>Block Explorer</span>
                    </Link>
                </nav>

                <div className={styles.systemStatus}>
                    <div className={styles.statusIndicator}></div>
                    <span>SYSTEM ONLINE</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={`${styles.header} glass-panel`}>
                    <h2 className={styles.headerTitle}>MATCH SIMULATION ENGINE v2.0</h2>
                    <div className={styles.networkInfo}>
                        <span>Network: testnet-1</span>
                        <span className={styles.tps}>24,501 TPS</span>
                    </div>
                </header>

                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}
