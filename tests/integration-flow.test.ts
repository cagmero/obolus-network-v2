/**
 * Integration test: Full shielded deposit → reveal → withdraw flow.
 * Tests the complete privacy lifecycle using server state.
 */
import {
  createDepositSlot,
  createShieldedPosition,
  getShieldedPositions,
  closeShieldedPosition,
  queueTransfer,
  getPendingTransfers,
  confirmTransfer,
  getTransfer,
} from '@/lib/server/state';

describe('Integration: Full Privacy Flow', () => {

  const ALICE = '0xalice_integration';
  const POOL = '0xpool_wallet';
  const TSLA = '0xtsla_token';

  it('should complete a full shield → reveal → unshield cycle', () => {
    // ── Step 1: Alice deposits on-chain (simulated) ──
    const depositTxHash = '0xdeposit_tx_alice_tsla';

    // ── Step 2: Create deposit slot ──
    const slot = createDepositSlot({
      userAddress: ALICE,
      token: TSLA,
      amount: '1000000000000000000', // 1 TSLAx
      depositTxHash,
      expiresAt: Date.now() + 600_000,
    });
    expect(slot.status).toBe('pending');

    // ── Step 3: Create shielded position (encrypted amount) ──
    const position = createShieldedPosition({
      userAddress: ALICE,
      token: TSLA,
      encryptedAmount: '0x04abc123_ecies_encrypted_1_tslax',
      shares: '1000000000000000000',
      vaultId: 'tslax',
    });
    expect(position.status).toBe('active');

    // ── Step 4: Queue shield transfer (Alice → Pool) ──
    const shieldTransfer = queueTransfer({
      sender: ALICE,
      recipient: POOL,
      token: TSLA,
      amount: '1000000000000000000',
      reason: 'shield',
    });
    expect(shieldTransfer.status).toBe('pending');

    // ── Step 5: CRE executes the shield transfer ──
    const pending = getPendingTransfers();
    const aliceTransfer = pending.find(t => t.transferId === shieldTransfer.transferId);
    expect(aliceTransfer).toBeDefined();
    expect(aliceTransfer!.reason).toBe('shield');

    confirmTransfer(shieldTransfer.transferId, '0xshield_tx_hash', 'completed');
    const confirmed = getTransfer(shieldTransfer.transferId);
    expect(confirmed!.status).toBe('completed');

    // ── Step 6: Privacy Reveal — Alice checks her positions ──
    const positions = getShieldedPositions(ALICE);
    expect(positions.length).toBeGreaterThanOrEqual(1);

    const tslaPos = positions.find(p => p.token === TSLA);
    expect(tslaPos).toBeDefined();
    expect(tslaPos!.encryptedAmount).toBe('0x04abc123_ecies_encrypted_1_tslax');
    // Note: server returns encrypted amount — client decrypts locally

    // ── Step 7: Alice initiates withdrawal ──
    closeShieldedPosition(ALICE, TSLA);

    // Queue unshield transfer (Pool → Alice)
    const unshieldTransfer = queueTransfer({
      sender: POOL,
      recipient: ALICE,
      token: TSLA,
      amount: '1000000000000000000',
      reason: 'unshield',
    });
    expect(unshieldTransfer.status).toBe('pending');

    // ── Step 8: CRE executes the unshield transfer ──
    confirmTransfer(unshieldTransfer.transferId, '0xunshield_tx_hash', 'completed');
    const unshieldConfirmed = getTransfer(unshieldTransfer.transferId);
    expect(unshieldConfirmed!.status).toBe('completed');

    // ── Step 9: Verify position is closed ──
    const finalPositions = getShieldedPositions(ALICE);
    const closedTsla = finalPositions.find(p => p.token === TSLA);
    expect(closedTsla).toBeUndefined(); // closed positions are filtered out

    // ── Step 10: Verify no pending transfers remain ──
    const remainingPending = getPendingTransfers();
    const alicePending = remainingPending.filter(
      t => t.sender === ALICE || t.recipient === ALICE
    );
    expect(alicePending.length).toBe(0);
  });

  it('should handle multiple users with isolated positions', () => {
    const BOB = '0xbob_integration';
    const NVDA = '0xnvda_token';

    // Alice deposits TSLAx
    createShieldedPosition({
      userAddress: ALICE,
      token: TSLA,
      encryptedAmount: '0xalice_tsla_encrypted',
      shares: '500',
      vaultId: 'tslax',
    });

    // Bob deposits NVDAon
    createShieldedPosition({
      userAddress: BOB,
      token: NVDA,
      encryptedAmount: '0xbob_nvda_encrypted',
      shares: '300',
      vaultId: 'nvdaon',
    });

    // Alice can only see her positions
    const alicePositions = getShieldedPositions(ALICE);
    expect(alicePositions.every(p => p.userAddress === ALICE)).toBe(true);

    // Bob can only see his positions
    const bobPositions = getShieldedPositions(BOB);
    expect(bobPositions.every(p => p.userAddress === BOB)).toBe(true);

    // CRE can see all positions (wildcard)
    const allPositions = getShieldedPositions('*');
    expect(allPositions.some(p => p.userAddress === ALICE)).toBe(true);
    expect(allPositions.some(p => p.userAddress === BOB)).toBe(true);
  });

  it('should handle concurrent shield and unshield transfers', () => {
    const USER1 = '0xuser1_concurrent';
    const USER2 = '0xuser2_concurrent';
    const TOKEN = '0xtoken_concurrent';

    // User1 shields
    const t1 = queueTransfer({
      sender: USER1, recipient: POOL, token: TOKEN,
      amount: '100', reason: 'shield',
    });

    // User2 unshields
    const t2 = queueTransfer({
      sender: POOL, recipient: USER2, token: TOKEN,
      amount: '200', reason: 'unshield',
    });

    const pending = getPendingTransfers();
    expect(pending.some(t => t.transferId === t1.transferId)).toBe(true);
    expect(pending.some(t => t.transferId === t2.transferId)).toBe(true);

    // CRE processes both
    confirmTransfer(t1.transferId, '0xt1hash', 'completed');
    confirmTransfer(t2.transferId, '0xt2hash', 'completed');

    // Both should be completed
    expect(getTransfer(t1.transferId)!.status).toBe('completed');
    expect(getTransfer(t2.transferId)!.status).toBe('completed');

    // Neither should be in pending anymore
    const afterPending = getPendingTransfers();
    expect(afterPending.find(t => t.transferId === t1.transferId)).toBeUndefined();
    expect(afterPending.find(t => t.transferId === t2.transferId)).toBeUndefined();
  });
});
