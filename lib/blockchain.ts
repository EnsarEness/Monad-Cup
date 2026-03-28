import crypto from 'crypto';

export interface SimulatedTransaction {
    txHash: string;
    timestamp: string;
    event_id: string; // The match_events id this tx corresponds to
}

/**
 * Simulates writing an event to the Monad blockchain.
 * Generates a txHash and adds a simulated network delay.
 */
export async function simulateBlockchainTx(eventId: string, eventData: string): Promise<SimulatedTransaction> {
    // Simulate network parallel execution delay (Monad is fast, so 50-200ms)
    const delay = Math.floor(Math.random() * 150) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate a mock Monad transaction hash directly from crypto
    // e.g. 0x + 64 hex chars
    const dataString = `${eventId}-${eventData}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    const txHash = `0x${hash}`;

    return {
        txHash,
        timestamp: new Date().toISOString(),
        event_id: eventId,
    };
}
