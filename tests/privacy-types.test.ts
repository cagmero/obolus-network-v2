/**
 * Tests for privacy type definitions — ensures type contracts are correct.
 */
import type {
  ShieldedPosition,
  DepositSlot,
  PendingTransfer,
  TransferReason,
  PoolBalance,
  RevealRequest,
  ShieldDepositResponse,
  WithdrawInitResponse,
} from '@/lib/privacy-types';

describe('Privacy Types', () => {

  it('should allow valid ShieldedPosition', () => {
    const pos: ShieldedPosition = {
      positionId: 'uuid-123',
      userAddress: '0xalice',
      token: '0xtsla',
      encryptedAmount: '0xdeadbeef',
      shares: '1000',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(pos.status).toBe('active');
    expect(pos.encryptedAmount).toMatch(/^0x/);
  });

  it('should allow all valid position statuses', () => {
    const statuses: ShieldedPosition['status'][] = [
      'active', 'pending_shield', 'pending_withdraw', 'closed'
    ];
    expect(statuses.length).toBe(4);
  });

  it('should allow valid DepositSlot', () => {
    const slot: DepositSlot = {
      slotId: 'slot-456',
      userAddress: '0xbob',
      token: '0xnvda',
      amount: '500',
      depositTxHash: '0xabc',
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 600_000,
    };
    expect(slot.status).toBe('pending');
  });

  it('should allow all valid transfer reasons', () => {
    const reasons: TransferReason[] = [
      'shield', 'unshield', 'rebalance', 'yield_collect'
    ];
    expect(reasons.length).toBe(4);
  });

  it('should allow valid PendingTransfer', () => {
    const transfer: PendingTransfer = {
      transferId: 'tx-789',
      sender: '0xalice',
      recipient: '0xpool',
      token: '0xtsla',
      amount: '1000',
      reason: 'shield',
      status: 'pending',
      createdAt: Date.now(),
    };
    expect(transfer.reason).toBe('shield');
  });

  it('should allow completed PendingTransfer with optional fields', () => {
    const transfer: PendingTransfer = {
      transferId: 'tx-completed',
      sender: '0xpool',
      recipient: '0xbob',
      token: '0xnvda',
      amount: '500',
      reason: 'unshield',
      status: 'completed',
      createdAt: Date.now(),
      executedAt: Date.now(),
      txHash: '0xfinaltx',
    };
    expect(transfer.status).toBe('completed');
    expect(transfer.txHash).toBeDefined();
  });

  it('should allow valid PoolBalance', () => {
    const balance: PoolBalance = {
      token: '0xtsla',
      totalShielded: '50000',
      lastUpdated: Date.now(),
    };
    expect(balance.totalShielded).toBe('50000');
  });

  it('should allow valid RevealRequest', () => {
    const reveal: RevealRequest = {
      requestId: 'reveal-001',
      userAddress: '0xalice',
      signature: '0xsig...',
      createdAt: Date.now(),
    };
    expect(reveal.positions).toBeUndefined();

    const revealWithPositions: RevealRequest = {
      ...reveal,
      positions: { '0xtsla': '1000', '0xnvda': '500' },
    };
    expect(revealWithPositions.positions?.['0xtsla']).toBe('1000');
  });

  it('should allow valid API response types', () => {
    const shieldResp: ShieldDepositResponse = {
      slotId: 'slot-1',
      status: 'pending',
      expiresAt: Date.now() + 600_000,
    };
    expect(shieldResp.status).toBe('pending');

    const withdrawResp: WithdrawInitResponse = {
      transferId: 'tx-1',
      status: 'pending',
      estimatedCompletion: Date.now() + 30_000,
    };
    expect(withdrawResp.status).toBe('pending');
  });
});
