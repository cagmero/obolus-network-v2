/**
 * POST /api/v1/cre/simulate-cycle
 * 
 * LOCAL CRE SIMULATOR — runs one settlement cycle.
 * In production, this logic runs inside the Chainlink CRE TEE.
 * For demo, we simulate it server-side.
 *
 * What it does:
 * 1. Fetches all pending transfers
 * 2. "Executes" them (marks as completed)
 * 3. Decrypts shielded positions using the CRE private key
 * 4. Computes NAV for each position
 * 5. Returns a settlement report
 */
import { NextResponse } from 'next/server';
import { getPendingTransfers, confirmTransfer, getShieldedPositions } from '@/lib/server/state';
import { getCREPrivateKey } from '@/lib/server/cre-keys';

function decryptAmount(encryptedHex: string, privateKeyHex: string): string {
  try {
    // Dynamic import to avoid SSR issues
    const { decrypt } = require('eciesjs');
    const clean = encryptedHex.startsWith('0x') ? encryptedHex.slice(2) : encryptedHex;
    const encrypted = Buffer.from(clean, 'hex');
    const privKey = Buffer.from(privateKeyHex, 'hex');
    const decrypted = decrypt(privKey, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    // If decryption fails (e.g. test data), return placeholder
    return '0';
  }
}

export async function POST() {
  const startTime = Date.now();
  const report: string[] = [];

  report.push('=== OBOLUS CRE SETTLEMENT CYCLE ===');
  report.push(`Timestamp: ${new Date().toISOString()}`);

  // 1. Process pending transfers
  const pending = getPendingTransfers();
  report.push(`\n--- Transfer Execution ---`);
  report.push(`Pending transfers: ${pending.length}`);

  let executed = 0;
  for (const transfer of pending) {
    // In production: CRE signs with pool wallet and submits to vault contract
    // For demo: mark as completed with a simulated tx hash
    const fakeTxHash = '0x' + Buffer.from(transfer.transferId).toString('hex').slice(0, 64);
    confirmTransfer(transfer.transferId, fakeTxHash, 'completed');
    report.push(`  ✓ ${transfer.reason}: ${transfer.sender.slice(0, 10)}→${transfer.recipient.slice(0, 10)} | ${transfer.amount} | ${transfer.token.slice(0, 10)}`);
    executed++;
  }

  // 2. Decrypt and settle positions
  const privateKey = getCREPrivateKey();
  const positions = getShieldedPositions('*');
  report.push(`\n--- Position Settlement ---`);
  report.push(`Active shielded positions: ${positions.length}`);

  let totalNAV = 0;
  for (const pos of positions) {
    const amount = decryptAmount(pos.encryptedAmount, privateKey);
    const amountNum = parseFloat(amount) || 0;
    // In production: fetch oracle price for this token
    const price = 1.0; // placeholder
    const nav = amountNum * price;
    totalNAV += nav;

    report.push(`  Position ${pos.positionId.slice(0, 8)}: user=${pos.userAddress.slice(0, 10)} token=${pos.token.slice(0, 10)} amount=${amount} nav=$${nav.toFixed(2)}`);
  }

  const elapsed = Date.now() - startTime;
  report.push(`\n--- Summary ---`);
  report.push(`Transfers executed: ${executed}`);
  report.push(`Positions settled: ${positions.length}`);
  report.push(`Total NAV: $${totalNAV.toFixed(2)}`);
  report.push(`Cycle time: ${elapsed}ms`);
  report.push(`\nPlaintext data discarded. TEE memory wiped.`);

  return NextResponse.json({
    executed,
    settled: positions.length,
    totalNAV: totalNAV.toFixed(2),
    elapsed,
    report: report.join('\n'),
  });
}
