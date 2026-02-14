import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  buildTransferTransaction,
  confirmTransaction,
  getBalance
} from '@/services/solana';

// ─── Platform Detection ───
function isWeb(): boolean {
  return Platform.OS === 'web';
}

// ─── Browser Extension Types (injected by wallet extensions on desktop) ───
interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (
    transaction: import('@solana/web3.js').Transaction
  ) => Promise<{ signature: string }>;
}

function getPhantomProvider(): SolanaProvider | null {
  if (!isWeb()) return null;
  const win = window as any;
  return win?.phantom?.solana?.isPhantom ? win.phantom.solana : win?.solana?.isPhantom ? win.solana : null;
}

function getSolflareProvider(): SolanaProvider | null {
  if (!isWeb()) return null;
  const win = window as any;
  return win?.solflare?.isSolflare ? win.solflare : null;
}

const WALLET_KEY = 'soltix_wallet_address';

async function getStoredWalletAddress(key: string): Promise<string | null> {
  if (isWeb()) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredWalletAddress(key: string, value: string): Promise<void> {
  if (isWeb()) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredWalletAddress(key: string): Promise<void> {
  if (isWeb()) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

// ─── Supported Wallets ───
export interface WalletProvider {
  name: string;
  icon: string;
  scheme: string; // deep link scheme
  connectUrl: string;
  popular: boolean;
}

export const WALLET_PROVIDERS: WalletProvider[] = [
  {
    name: 'Phantom',
    icon: '👻',
    scheme: 'phantom',
    connectUrl: 'https://phantom.app/ul/v1/connect',
    popular: true,
  },
  {
    name: 'Solflare',
    icon: '🔥',
    scheme: 'solflare',
    connectUrl: 'https://solflare.com/ul/v1/connect',
    popular: true,
  },
  {
    name: 'MetaMask',
    icon: '🦊',
    scheme: 'metamask',
    connectUrl: 'https://metamask.app.link/dapp/soltix.app',
    popular: true,
  },
  {
    name: 'Backpack',
    icon: '🎒',
    scheme: 'backpack',
    connectUrl: 'https://backpack.app/ul/v1/connect',
    popular: false,
  },
  {
    name: 'Glow',
    icon: '✨',
    scheme: 'glow',
    connectUrl: 'glow://connect',
    popular: false,
  },
];

// ─── Encode for deep link ───
function encodeBase58(bytes: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  let num = BigInt(0);
  for (const byte of bytes) {
    num = num * BigInt(256) + BigInt(byte);
  }
  while (num > 0) {
    result = ALPHABET[Number(num % BigInt(58))] + result;
    num = num / BigInt(58);
  }
  for (const byte of bytes) {
    if (byte === 0) result = '1' + result;
    else break;
  }
  return result;
}

// ─── Connect via Phantom ───
export async function connectPhantomWallet(): Promise<{
  publicKey: string;
  balance: number;
} | null> {
  // Desktop/Web: use browser extension
  if (isWeb()) {
    const provider = getPhantomProvider();
    if (!provider) {
      window.open('https://phantom.app/download', '_blank');
      throw new Error('Phantom extension not installed. Please install it and refresh the page.');
    }
    try {
      const resp = await provider.connect();
      const address = resp.publicKey.toBase58();
      const balance = await getBalance(address);
      await setStoredWalletAddress(WALLET_KEY, address);
      return { publicKey: address, balance };
    } catch (error: any) {
      if (error?.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw new Error('Failed to connect to Phantom extension');
    }
  }

  // Mobile: use deep link
  try {
    const redirectUrl = Linking.createURL('onConnect');

    const params = new URLSearchParams({
      app_url: 'https://soltix.app',
      dapp_encryption_public_key: '', // simplified for MVP — use nacl in production
      redirect_link: redirectUrl,
      cluster: process.env.EXPO_PUBLIC_NETWORK || 'devnet',
    });

    const connectUrl = `https://phantom.app/ul/v1/connect?${params.toString()}`;

    const supported = await Linking.canOpenURL('phantom://');

    if (supported) {
      await Linking.openURL(connectUrl);
      return null; // Will be resolved via deep link callback
    } else {
      await Linking.openURL('https://phantom.app/download');
      return null;
    }
  } catch (error) {
    console.error('Error connecting Phantom:', error);
    throw new Error('Failed to connect to Phantom wallet');
  }
}

// ─── Connect via Solflare ───
export async function connectSolflareWallet(): Promise<{
  publicKey: string;
  balance: number;
} | null> {
  // Desktop/Web: use browser extension
  if (isWeb()) {
    const provider = getSolflareProvider();
    if (!provider) {
      window.open('https://solflare.com/download', '_blank');
      throw new Error('Solflare extension not installed. Please install it and refresh the page.');
    }
    try {
      const resp = await provider.connect();
      const address = resp.publicKey.toBase58();
      const balance = await getBalance(address);
      await setStoredWalletAddress(WALLET_KEY, address);
      return { publicKey: address, balance };
    } catch (error: any) {
      if (error?.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw new Error('Failed to connect to Solflare extension');
    }
  }

  // Mobile: use deep link
  try {
    const redirectUrl = Linking.createURL('onConnect');

    const params = new URLSearchParams({
      app_url: 'https://soltix.app',
      redirect_link: redirectUrl,
      cluster: process.env.EXPO_PUBLIC_NETWORK || 'devnet',
    });

    const connectUrl = `https://solflare.com/ul/v1/connect?${params.toString()}`;

    const supported = await Linking.canOpenURL('solflare://');

    if (supported) {
      await Linking.openURL(connectUrl);
      return null;
    } else {
      await Linking.openURL('https://solflare.com/download');
      return null;
    }
  } catch (error) {
    console.error('Error connecting Solflare:', error);
    throw new Error('Failed to connect to Solflare wallet');
  }
}

// ─── Connect via MetaMask ───
export async function connectMetamaskWallet(): Promise<{
  publicKey: string;
  balance: number;
} | null> {
  // Desktop/Web: use browser extension
  if (isWeb()) {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      throw new Error('MetaMask extension not installed. Please install it and refresh the page.');
    }
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];
      const provider = new ethers.BrowserProvider(ethereum);
      const balanceWei = await provider.getBalance(address);
      const balance = parseFloat(ethers.formatEther(balanceWei));
      await setStoredWalletAddress(WALLET_KEY, address);
      return { publicKey: address, balance };
    } catch (error: any) {
      if (error?.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw new Error('Failed to connect to MetaMask extension');
    }
  }

  // Mobile: use deep link
  try {
    const dappUrl = 'https://soltix.app';
    const connectUrl = `https://metamask.app.link/dapp/${dappUrl}`;

    const supported = await Linking.canOpenURL('metamask://');

    if (supported) {
      await Linking.openURL(connectUrl);
      return null; // Will be resolved via deep link callback or manual entry
    } else {
      await Linking.openURL('https://metamask.io/download/');
      return null;
    }
  } catch (error) {
    console.error('Error connecting MetaMask:', error);
    throw new Error('Failed to connect to MetaMask wallet');
  }
}

// ─── Handle Deep Link Callback ───
export async function handleWalletCallback(
  url: string
): Promise<{ publicKey: string; balance: number } | null> {
  try {
    const parsed = Linking.parse(url);
    const pubKeyParam =
      parsed.queryParams?.phantom_encryption_public_key ||
      parsed.queryParams?.public_key;

    if (typeof pubKeyParam === 'string' && pubKeyParam.length > 0) {
      // Validate the public key is a well-formed Solana address
      let validatedKey: string;
      try {
        const pk = new PublicKey(pubKeyParam);
        validatedKey = pk.toBase58();
      } catch {
        console.error('Invalid wallet public key received:', pubKeyParam);
        return null;
      }

      const balance = await getBalance(validatedKey);

      // Persist the validated wallet address
      await setStoredWalletAddress(WALLET_KEY, validatedKey);

      return { publicKey: validatedKey, balance };
    }

    return null;
  } catch (error) {
    console.error('Error handling wallet callback:', error);
    return null;
  }
}

// ─── Restore Saved Session ───
export async function restoreSavedWallet(): Promise<{
  publicKey: string;
  balance: number;
} | null> {
  try {
    const savedAddress = await getStoredWalletAddress(WALLET_KEY);
    if (savedAddress) {
      const balance = await getBalance(savedAddress);
      return { publicKey: savedAddress, balance };
    }
    return null;
  } catch (error) {
    console.error('Error restoring wallet:', error);
    return null;
  }
}

// ─── Disconnect Wallet ───
export async function disconnectWallet(): Promise<void> {
  try {
    await deleteStoredWalletAddress(WALLET_KEY);
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

// ─── Save Wallet Address ───
export async function saveWalletAddress(address: string): Promise<void> {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    throw new Error('Invalid wallet address: address cannot be empty');
  }

  // Validate it's a proper Solana public key
  let canonicalAddress: string;
  try {
    const pk = new PublicKey(address);
    canonicalAddress = pk.toBase58();
  } catch {
    throw new Error(`Invalid Solana public key: ${address}`);
  }

  await setStoredWalletAddress(WALLET_KEY, canonicalAddress);
}

// ─── Sign & Send Transfer ───
export async function sendPayment(
  fromWallet: string,
  toWallet: string,
  amountSol: number
): Promise<{ signature: string; success: boolean; pending?: boolean }> {
  // Validate inputs
  if (!fromWallet || typeof fromWallet !== 'string' || fromWallet.trim().length === 0) {
    throw new Error('Invalid sender wallet address');
  }
  if (!toWallet || typeof toWallet !== 'string' || toWallet.trim().length === 0) {
    throw new Error('Invalid recipient wallet address');
  }
  if (typeof amountSol !== 'number' || !Number.isFinite(amountSol) || amountSol <= 0) {
    throw new Error('Invalid payment amount: must be a positive number');
  }

  try {
    const fromPubkey = new PublicKey(fromWallet);
    const toPubkey = new PublicKey(toWallet);

    const { transaction, blockhash, lastValidBlockHeight } = await buildTransferTransaction(
      fromPubkey,
      toPubkey,
      amountSol
    );

    // Desktop/Web: sign & send via browser extension
    if (isWeb()) {
      const provider = getPhantomProvider() || getSolflareProvider();
      if (!provider) {
        throw new Error('No wallet extension found. Please install Phantom or Solflare.');
      }

      const { signature } = await provider.signAndSendTransaction(transaction);
      await confirmTransaction(signature, blockhash, lastValidBlockHeight);
      return { signature, success: true };
    }

    // Mobile: deep link to wallet app for signing
    const serializedTx = transaction
      .serialize({ requireAllSignatures: false })
      .toString('base64');

    const redirectUrl = Linking.createURL('onSignTransaction');

    const params = new URLSearchParams({
      transaction: serializedTx,
      redirect_link: redirectUrl,
    });

    const signUrl = `https://phantom.app/ul/v1/signAndSendTransaction?${params.toString()}`;

    await Linking.openURL(signUrl);

    // The signature will come back via deep link callback
    // Return pending state — caller should listen for callback
    return { signature: '', success: false, pending: true };
  } catch (error) {
    console.error('Error sending payment:', error);
    throw new Error('Failed to send transaction');
  }
}
