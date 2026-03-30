/**
 * Obolus Privacy Layer — Type definitions.
 * Mirrors Ghost Finance's three-layer trust model adapted for RWA equity vaults.
 */

// ── Shielded Positions ──────────────────────────────

export interface ShieldedPosition {
  positionId: string;
  userAddress: string;
  token: string;
  /** ECIES-encrypted amount — only CRE can decrypt */
  encryptedAmount: string;
  /** Vault share receipt (wGM tokens) */
  shares: string;
  status: 'active' | 'pending_shield' | 'pending_withdraw' | 'closed';
  createdAt: number;
  updatedAt: number;
}

// ── Deposit Slots (TTL-based, like Ghost) ───────────

export interface DepositSlot {
  slotId: string;
  userAddress: string;
  token: string;
  amount: string;
  /** On-chain deposit tx hash */
  depositTxHash: string;
  status: 'pending' | 'shielded' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt: number;
}

// ── Pending Transfers (CRE executes these) ──────────

export type TransferReason =
  | 'shield'          // user → pool (after deposit)
  | 'unshield'        // pool → user (withdrawal)
  | 'rebalance'       // pool internal rebalance
  | 'yield_collect';  // yield distribution

export interface PendingTransfer {
  transferId: string;
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  reason: TransferReason;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: number;
  executedAt?: number;
  txHash?: string;
}

// ── Pool Wallet State ───────────────────────────────

export interface PoolBalance {
  token: string;
  totalShielded: string;
  lastUpdated: number;
}

// ── Privacy Reveal Request ──────────────────────────

export interface RevealRequest {
  requestId: string;
  userAddress: string;
  /** Signature used to derive decryption key */
  signature: string;
  /** Decrypted positions (only returned to the requesting user) */
  positions?: Record<string, string>;
  createdAt: number;
}

// ── Server API Response Types ───────────────────────

export interface ShieldDepositResponse {
  slotId: string;
  status: 'pending';
  expiresAt: number;
}

export interface ShieldConfirmResponse {
  positionId: string;
  transferId: string;
  status: 'shielded';
}

export interface WithdrawInitResponse {
  transferId: string;
  status: 'pending';
  estimatedCompletion: number;
}

export interface RevealResponse {
  positions: Record<string, {
    encryptedAmount: string;
    shares: string;
    token: string;
  }>;
}
