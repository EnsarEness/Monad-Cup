import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/Layout';

export const metadata: Metadata = {
    title: 'AI World Cup on Monad',
    description: 'AI-powered match simulation running on Monad testnet.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AppLayout>{children}</AppLayout>
            </body>
        </html>
    );
}
