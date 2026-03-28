'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WorldCupBettingContract, WORLD_CUP_BETTING_ABI } from '@/lib/contracts/WorldCupBetting';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  isConnected: boolean;
  contract: WorldCupBettingContract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
  isLoading: boolean;
  chainId: number | null;
  isMonadNetwork: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const MONAD_CHAIN_ID = 10143;
const MONAD_TESTNET = {
  chainId: '0x' + MONAD_CHAIN_ID.toString(16),
  chainName: 'Monad Testnet',
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monad.xyz'],
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<WorldCupBettingContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const addMonadNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_TESTNET],
      });
    } catch (error: any) {
      if (error.code !== 4001) {
        console.error('Error adding Monad network:', error);
      }
    }
  };

  const switchToMonadNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await addMonadNetwork();
      } else {
        console.error('Error switching network:', error);
      }
    }
  };

  const getCurrentChainId = async (selectedProvider: ethers.BrowserProvider) => {
    try {
      const network = await selectedProvider.getNetwork();
      setChainId(Number(network.chainId));
      return Number(network.chainId);
    } catch (err) {
      console.error('Error getting chain ID:', err);
      return null;
    }
  };

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        const currentChainId = await getCurrentChainId(provider);

        if (accounts.length > 0) {
          if (currentChainId !== MONAD_CHAIN_ID) {
            await switchToMonadNetwork();
            await new Promise(r => setTimeout(r, 1000));
          }
          await initializeWeb3(provider);
        }
      }
    } catch (err) {
      console.error('Auto-connect failed:', err);
    }
  };

  const initializeWeb3 = async (selectedProvider: ethers.BrowserProvider) => {
    try {
      setIsLoading(true);
      const accounts = await selectedProvider.listAccounts();
      if (accounts.length === 0) throw new Error('No accounts found');

      const signer = await selectedProvider.getSigner();
      const address = accounts[0].address;

      setProvider(selectedProvider);
      setSigner(signer);
      setAccount(address);
      setError(null);

      const contractAddress = process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS;
      if (contractAddress) {
        const wrapped = new WorldCupBettingContract(
          contractAddress,
          process.env.NEXT_PUBLIC_RPC_URL
        );
        setContract(wrapped);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Web3 initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask veya Web3 Wallet yüklü değil.');
      }

      // Her zaman hesap seçim ekranını göster
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      await switchToMonadNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      await initializeWeb3(provider);
    } catch (err: any) {
      if ((err as any).code !== 4001) {
        // 4001 = kullanıcı iptal etti, sessizce geç
        setError(err.message);
        console.error('Wallet connection failed:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setError(null);
    setChainId(null);
  };

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        checkWalletConnection();
      }
    };
    const handleChainChanged = () => {
      checkWalletConnection();
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      if (window.ethereum?.off) {
        window.ethereum.off('accountsChanged', handleAccountsChanged);
        window.ethereum.off('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    isConnected: !!account,
    contract,
    connectWallet,
    disconnectWallet,
    error,
    isLoading,
    chainId,
    isMonadNetwork: chainId === MONAD_CHAIN_ID,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
