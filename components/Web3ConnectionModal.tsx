'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/lib/context/Web3Context';
import { ethers } from 'ethers';
import { Wallet, Network, LogOut, RefreshCw } from 'lucide-react';

const MONAD_TESTNET_CHAIN_ID = '0x27ef'; // 10143 in hex

export default function Web3ConnectionModal() {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, provider } = useWeb3();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      checkNetwork();
      fetchBalance();
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.on('chainChanged', checkNetwork);
        window.ethereum.on('accountsChanged', fetchBalance);
        return () => {
          if (window.ethereum?.off) {
            window.ethereum.off('chainChanged', checkNetwork);
            window.ethereum.off('accountsChanged', fetchBalance);
          }
        };
      }
    } else {
      setBalance(null);
    }
  }, [isConnected, account]);

  const fetchBalance = async () => {
    try {
      if (!window.ethereum || !account) return;
      const p = new ethers.BrowserProvider(window.ethereum);
      const raw = await p.getBalance(account);
      const formatted = parseFloat(ethers.formatEther(raw)).toFixed(4);
      setBalance(formatted);
    } catch (err) {
      console.error('Balance fetch failed:', err);
    }
  };

  const checkNetwork = async () => {
    try {
      if (!window.ethereum) return;
      const p = new ethers.BrowserProvider(window.ethereum);
      const network = await p.getNetwork();
      setIsCorrectNetwork(Number(network.chainId) === 10143);
    } catch (err) {
      console.error('Network check failed:', err);
    }
  };

  const switchToMonadTestnet = async () => {
    try {
      if (!window.ethereum) return;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_CHAIN_ID }],
      });
      checkNetwork();
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MONAD_TESTNET_CHAIN_ID,
                chainName: 'Monad Testnet',
                rpcUrls: ['https://testnet-rpc.monad.xyz'],
                nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
                blockExplorerUrls: ['https://testnet.monad.xyz'],
              },
            ],
          });
          checkNetwork();
        } catch (addError) { }
      }
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isLoading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
          background: '#8a2be2', color: 'white', borderRadius: '8px',
          border: 'none', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        <Wallet size={18} />
        {isLoading ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(20,20,30,0.8)',
      padding: '6px 16px', borderRadius: '12px', border: '1px solid #333'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <Wallet size={16} color="#8a2be2" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
          {balance !== null && (
            <span style={{ fontSize: '11px', color: '#a78bfa', fontFamily: 'monospace' }}>
              {balance} MON
            </span>
          )}
        </div>
      </div>

      {!isCorrectNetwork && (
        <button
          onClick={switchToMonadTestnet}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', background: '#e74c3c',
            color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
          }}
        >
          <Network size={14} />
          Monad&apos;a Geç
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #444', paddingLeft: '12px' }}>
        <button
          onClick={connectWallet}
          title="Hesap Değiştir"
          style={{ background: 'transparent', border: 'none', color: '#4a90e2', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={disconnectWallet}
          title="Çıkış Yap"
          style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}