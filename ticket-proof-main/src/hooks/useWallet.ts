import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
  
  // Actions
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => void;
  updateBalance: (balance: string) => void;
}

// Demo wallet store for frontend-only implementation
export const useWallet = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      chainId: null,
      balance: '0',

      connectWallet: (address) => {
        set({
          address,
          isConnected: true,
          chainId: 11155111, // Sepolia testnet
          balance: '1.5', // Demo balance in ETH
        });
      },

      disconnectWallet: () => {
        set({
          address: null,
          isConnected: false,
          chainId: null,
          balance: '0',
        });
      },

      switchChain: (chainId) => {
        set({ chainId });
      },

      updateBalance: (balance) => {
        set({ balance });
      },
    }),
    {
      name: 'wallet-state',
    }
  )
);

// Demo wallet addresses for testing
export const DEMO_WALLETS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
];

export const connectDemoWallet = () => {
  const randomWallet = DEMO_WALLETS[Math.floor(Math.random() * DEMO_WALLETS.length)];
  useWallet.getState().connectWallet(randomWallet);
  return randomWallet;
};