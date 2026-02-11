import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';

// ─── Solana Connection ───
const network = (process.env.EXPO_PUBLIC_NETWORK as 'devnet' | 'mainnet-beta') || 'devnet';
const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);

export const connection = new Connection(rpcUrl, 'confirmed');

// ─── Get SOL Balance ───
export async function getBalance(walletAddress: string): Promise<number> {
  const publicKey = new PublicKey(walletAddress);
  const lamports = await connection.getBalance(publicKey);
  return lamports / LAMPORTS_PER_SOL;
}

// ─── Validate Solana Address ───
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// ─── Build Transfer Transaction ───
export async function buildTransferTransaction(
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amountSol: number
): Promise<{ transaction: Transaction; blockhash: string; lastValidBlockHeight: number }> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');

  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromPubkey;

  return { transaction, blockhash, lastValidBlockHeight };
}

// ─── Confirm Transaction ───
export async function confirmTransaction(
  signature: string,
  originalBlockhash: string,
  lastValidBlockHeight: number
): Promise<boolean> {
  try {
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: originalBlockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    return !confirmation.value.err;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return false;
  }
}

// ─── Get Transaction Details ───
export async function getTransactionDetails(signature: string) {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    return tx;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

// ─── Get Recent Transactions ───
export async function getRecentTransactions(walletAddress: string, limit = 10) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
    });
    return signatures;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// ─── Get Current Slot / Network Status ───
export async function getNetworkStatus() {
  try {
    const [slot, blockHeight, epochInfo] = await Promise.all([
      connection.getSlot(),
      connection.getBlockHeight(),
      connection.getEpochInfo(),
    ]);

    return {
      slot,
      blockHeight,
      epoch: epochInfo.epoch,
      network,
      rpcUrl: (() => {
        try {
          return new URL(rpcUrl).origin;
        } catch {
          return 'unknown';
        }
      })(),
    };
  } catch (error) {
    console.error('Error fetching network status:', error);
    return null;
  }
}

// ─── Airdrop SOL (devnet only) ───
export async function requestAirdrop(
  walletAddress: string,
  amountSol: number = 1
): Promise<string | null> {
  if (network !== 'devnet') {
    console.warn('Airdrop only available on devnet');
    return null;
  }

  try {
    const publicKey = new PublicKey(walletAddress);
    const signature = await connection.requestAirdrop(
      publicKey,
      Math.round(amountSol * LAMPORTS_PER_SOL)
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    await confirmTransaction(signature, blockhash, lastValidBlockHeight);
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    return null;
  }
}
