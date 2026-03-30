/**
 * Tests for the server-side blind storage layer.
 * Verifies deposit slots, shielded positions, and transfer queue.
 */
import {
  createDepositSlot,
  createShieldedPosition,
  getShieldedPositions,
  closeShieldedPosition,
  queueTransfer,
  getPendingTransfers,
  getTransfer,
  confirmTransfer,
  cleanupExpiredSlots,
} from '@/lib/server/state';

describe('Server State — Blind Storage', () => {

  describe('Deposit Slots', () => {
    it('should create a deposit slot with TTL', () => {
      const slot = createDepositSlot({
        userAddress: '0xalice',
        token: '0xtsla',
        amount: '1000000000000000000',
        depositTxHash: '0xabc123',
        expiresAt: Date.now() + 600_000,
      });

      expect(slot.slotId).toBeDefined();
      expect(slot.status).toBe('pending');
      expect(slot.userAddress).toBe('0xalice');
      expect(slot.token).toBe('0xtsla');
      expect(slot.amount).toBe('1000000000000000000');
      expect(slot.depositTxHash).toBe('0xabc123');
    });

    it('should expire old slots', () => {
      // Create an already-expired slot
      createDepositSlot({
        userAddress: '0xbob',
        token: '0xnvda',
        amount: '500',
        depositTxHash: '0xdef456',
        expiresAt: Date.now() - 1000, // expired 1s ago
      });

      const cleaned = cleanupExpiredSlots();
      expect(cleaned).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Shielded Positions', () => {
    it('should create a shielded position with encrypted amount', () => {
      const pos = createShieldedPosition({
        userAddress: '0xalice',
        token: '0xtsla',
        encryptedAmount: '0xdeadbeef_encrypted_ciphertext',
        shares: '1000000000000000000',
        vaultId: 'tslax',
      });

      expect(pos.positionId).toBeDefined();
      expect(pos.status).toBe('active');
      expect(pos.encryptedAmount).toBe('0xdeadbeef_encrypted_ciphertext');
    });

    it('should retrieve positions for a specific user', () => {
      createShieldedPosition({
        userAddress: '0xcharlie',
        token: '0xaapl',
        encryptedAmount: '0xencrypted_aapl',
        shares: '200',
        vaultId: 'aaplx',
      });

      const positions = getShieldedPositions('0xcharlie');
      expect(positions.length).toBeGreaterThanOrEqual(1);
      expect(positions.some(p => p.token === '0xaapl')).toBe(true);
    });

    it('should return all positions with wildcard *', () => {
      const all = getShieldedPositions('*');
      expect(all.length).toBeGreaterThanOrEqual(1);
    });

    it('should not return closed positions', () => {
      createShieldedPosition({
        userAddress: '0xdave',
        token: '0xspy',
        encryptedAmount: '0xencrypted_spy',
        shares: '300',
        vaultId: 'spyx',
      });

      closeShieldedPosition('0xdave', '0xspy');

      const positions = getShieldedPositions('0xdave');
      const spyPos = positions.find(p => p.token === '0xspy');
      expect(spyPos).toBeUndefined();
    });

    it('should update existing position for same user+token', () => {
      createShieldedPosition({
        userAddress: '0xeve',
        token: '0xgoogl',
        encryptedAmount: '0xfirst_deposit',
        shares: '100',
        vaultId: 'googlx',
      });

      const updated = createShieldedPosition({
        userAddress: '0xeve',
        token: '0xgoogl',
        encryptedAmount: '0xsecond_deposit',
        shares: '200',
        vaultId: 'googlx',
      });

      // Should reuse the same positionId
      const positions = getShieldedPositions('0xeve');
      const googlPositions = positions.filter(p => p.token === '0xgoogl');
      expect(googlPositions.length).toBe(1);
      expect(googlPositions[0].encryptedAmount).toBe('0xsecond_deposit');
      expect(googlPositions[0].shares).toBe('200');
    });
  });

  describe('Pending Transfers', () => {
    it('should queue a shield transfer', () => {
      const transfer = queueTransfer({
        sender: '0xalice',
        recipient: '0xpool',
        token: '0xtsla',
        amount: '1000',
        reason: 'shield',
      });

      expect(transfer.transferId).toBeDefined();
      expect(transfer.status).toBe('pending');
      expect(transfer.reason).toBe('shield');
    });

    it('should queue an unshield transfer', () => {
      const transfer = queueTransfer({
        sender: '0xpool',
        recipient: '0xbob',
        token: '0xnvda',
        amount: '500',
        reason: 'unshield',
      });

      expect(transfer.status).toBe('pending');
      expect(transfer.reason).toBe('unshield');
    });

    it('should return only pending transfers', () => {
      const pending = getPendingTransfers();
      expect(pending.every(t => t.status === 'pending')).toBe(true);
    });

    it('should confirm a transfer with txHash', () => {
      const transfer = queueTransfer({
        sender: '0xpool',
        recipient: '0xfrank',
        token: '0xqqq',
        amount: '750',
        reason: 'unshield',
      });

      const ok = confirmTransfer(transfer.transferId, '0xtxhash123', 'completed');
      expect(ok).toBe(true);

      const confirmed = getTransfer(transfer.transferId);
      expect(confirmed?.status).toBe('completed');
      expect(confirmed?.txHash).toBe('0xtxhash123');
      expect(confirmed?.executedAt).toBeDefined();
    });

    it('should mark a transfer as failed', () => {
      const transfer = queueTransfer({
        sender: '0xpool',
        recipient: '0xgrace',
        token: '0xmu',
        amount: '250',
        reason: 'unshield',
      });

      confirmTransfer(transfer.transferId, '', 'failed');

      const failed = getTransfer(transfer.transferId);
      expect(failed?.status).toBe('failed');
    });

    it('should return false for non-existent transfer', () => {
      const ok = confirmTransfer('non-existent-id', '0x', 'completed');
      expect(ok).toBe(false);
    });

    it('should not include confirmed transfers in pending list', () => {
      const transfer = queueTransfer({
        sender: '0xpool',
        recipient: '0xhank',
        token: '0xamzn',
        amount: '100',
        reason: 'unshield',
      });

      confirmTransfer(transfer.transferId, '0xdone', 'completed');

      const pending = getPendingTransfers();
      expect(pending.find(t => t.transferId === transfer.transferId)).toBeUndefined();
    });
  });
});
