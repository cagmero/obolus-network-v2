/**
 * Obolus Server State — In-memory blind storage.
 *
 * This is the "dumb blob store" layer. It holds encrypted data
 * but cannot decrypt any of it. Only the CRE has the private key.
 *
 * In production, replace with MongoDB/Supabase persistence.
 */
import type {
  ShieldedPosition,
  DepositSlot,
  PendingTransfer,
  TransferReason,
} from '@/lib/privacy-types';

// ── In-memory stores ────────────────────────────────

const depositSlots = new Map<string, DepositSlot>();
const shieldedPositions = new Map<string, ShieldedPosition>();
const pendingTransfers = new Map<string, PendingTransfer>();

// ── Deposit Slots ───────────────────────────────────

export function createDepositSlot(params: {
  userAddress: string;
  token: string;
  amount: string;
  depositTxHash: string;
  expiresAt: number;
}): DepositSlot {
  const slot: DepositSlot = {
    slotId: crypto.randomUUID(),
    userAddress: params.userAddress,
    token: params.token,
    amount: params.amount,
    depositTxHash: params.depositTxHash,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: params.expiresAt,
  };
  depositSlots.set(slot.slotId, slot);
  return slot;
}

// ── Shielded Positions ──────────────────────────────

export function createShieldedPosition(params: {
  userAddress: string;
  token: string;
  encryptedAmount: string;
  shares: string;
  vaultId: string;
}): ShieldedPosition {
  const key = `${params.userAddress}:${params.token}`;
  const existing = shieldedPositions.get(key);

  const position: ShieldedPosition = {
    positionId: existing?.positionId || crypto.randomUUID(),
    userAddress: params.userAddress,
    token: params.token,
    encryptedAmount: params.encryptedAmount,
    shares: params.shares,
    status: 'active',
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  shieldedPositions.set(key, position);
  return position;
}

export function getShieldedPositions(userAddress: string): ShieldedPosition[] {
  const results: ShieldedPosition[] = [];
  for (const pos of shieldedPositions.values()) {
    if (pos.status !== 'active') continue;
    // Wildcard '*' returns all active positions (used by CRE)
    if (userAddress === '*' || pos.userAddress === userAddress) {
      results.push(pos);
    }
  }
  return results;
}

export function closeShieldedPosition(userAddress: string, token: string): boolean {
  const key = `${userAddress}:${token}`;
  const pos = shieldedPositions.get(key);
  if (!pos) return false;
  pos.status = 'closed';
  pos.updatedAt = Date.now();
  return true;
}

// ── Pending Transfers ───────────────────────────────

export function queueTransfer(params: {
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  reason: TransferReason;
}): PendingTransfer {
  const transfer: PendingTransfer = {
    transferId: crypto.randomUUID(),
    sender: params.sender,
    recipient: params.recipient,
    token: params.token,
    amount: params.amount,
    reason: params.reason,
    status: 'pending',
    createdAt: Date.now(),
  };
  pendingTransfers.set(transfer.transferId, transfer);
  return transfer;
}

export function getPendingTransfers(): PendingTransfer[] {
  return Array.from(pendingTransfers.values()).filter(t => t.status === 'pending');
}

export function getTransfer(transferId: string): PendingTransfer | undefined {
  return pendingTransfers.get(transferId);
}

export function confirmTransfer(
  transferId: string,
  txHash: string,
  status: 'completed' | 'failed' = 'completed'
): boolean {
  const transfer = pendingTransfers.get(transferId);
  if (!transfer) return false;
  transfer.status = status;
  transfer.txHash = txHash;
  transfer.executedAt = Date.now();
  return true;
}

// ── Cleanup (expire old slots) ──────────────────────

export function cleanupExpiredSlots(): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, slot] of depositSlots) {
    if (slot.status === 'pending' && slot.expiresAt < now) {
      slot.status = 'expired';
      cleaned++;
    }
  }
  return cleaned;
}
