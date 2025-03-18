import { useCallback } from 'react';

declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getKey: (chainId: string) => Promise<{
        name: string;
        algo: string;
        pubKey: Uint8Array;
        address: string;
        bech32Address: string;
      }>;
      disable: (chainId: string) => Promise<void>;
    };
  }
}

const CHAIN_ID = "cosmoshub-4"; // Cosmos Hub mainnet chain ID

export function useKeplerWallet() {
  const connect = useCallback(async () => {
    if (!window.keplr) {
      throw new Error("Please install Keplr wallet");
    }

    try {
      await window.keplr.enable(CHAIN_ID);
      const key = await window.keplr.getKey(CHAIN_ID);
      return key.bech32Address;
    } catch (error) {
      console.error('Failed to connect Keplr:', error);
      throw new Error("Failed to connect to Keplr wallet");
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!window.keplr) {
      console.error('Keplr wallet not found');
      return;
    }

    try {
      await window.keplr.disable(CHAIN_ID);
      // Clear local storage
      window.localStorage.removeItem('wallet_address');
    } catch (error) {
      console.error('Failed to disconnect Keplr:', error);
      throw new Error("Failed to disconnect from Keplr wallet");
    }
  }, []);

  return { connect, disconnect };
}