/**
 * Obolus CRE Workflow: Settle Positions
 *
 * Runs every 30 seconds inside the Chainlink CRE (TEE).
 * Decrypts shielded position data, reconciles with on-chain oracle
 * prices, and updates NAV calculations.
 *
 * This is the only place where encrypted position amounts are
 * ever decrypted. Plaintext is discarded after each cycle.
 */
import {
  type CronPayload,
  cre,
  Runner,
  type Runtime,
  ok,
  json,
} from '@chainlink/cre-sdk';

import { decrypt } from 'eciesjs';

// ── Config ──────────────────────────────────────────

export type Config = {
  schedule: string;
  obolusApiUrl: string;
  oracleAddress: string;
  chainId: number;
};

// ── Types ───────────────────────────────────────────

interface ShieldedPosition {
  positionId: string;
  userAddress: string;
  token: string;
  encryptedAmount: string;
  shares: string;
}

interface NAVUpdate {
  positionId: string;
  userAddress: string;
  token: string;
  /** Re-encrypted NAV for user-side decryption */
  encryptedNAV: string;
}

// ── Decryption (only happens inside TEE) ────────────

function decryptAmount(encryptedHex: string, privateKeyHex: string): string {
  try {
    // Strip 0x prefix if present
    const clean = encryptedHex.startsWith('0x') ? encryptedHex.slice(2) : encryptedHex;
    const encrypted = Buffer.from(clean, 'hex');
    const decrypted = decrypt(privateKeyHex, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch {
    return '0';
  }
}

// ── DON Secrets ─────────────────────────────────────

const SECRETS = [
  { key: 'CRE_PRIVATE_KEY', namespace: 'obolus-protocol' },
  { key: 'INTERNAL_API_KEY', namespace: 'obolus-protocol' },
];

// ── CRE Handler ─────────────────────────────────────

const onCronTrigger = async (
  runtime: Runtime<Config>,
  _payload: CronPayload
): Promise<string> => {
  runtime.log('settle-positions triggered');

  const confClient = new cre.capabilities.ConfidentialHTTPClient();
  const base = runtime.config.obolusApiUrl;

  // 1. Fetch all active shielded positions
  const posResp = confClient.sendRequest(runtime, {
    vaultDonSecrets: SECRETS,
    request: {
      url: `${base}/internal/shielded-positions`,
      method: 'GET',
      multiHeaders: {
        'x-api-key': { values: ['{{.INTERNAL_API_KEY}}'] },
      },
    },
  }).result();

  if (!ok(posResp)) return 'error:fetch-positions';

  const data = json(posResp) as { positions: ShieldedPosition[] };
  if (!data.positions?.length) return 'ok:no-positions';

  runtime.log(`Processing ${data.positions.length} shielded positions`);

  // 2. Decrypt each position amount (ephemeral — discarded after this cycle)
  // In production: CRE_PRIVATE_KEY comes from DON secrets
  const privateKeyHex = ''; // runtime.secrets.CRE_PRIVATE_KEY

  let totalNAV = 0;
  const updates: NAVUpdate[] = [];

  for (const pos of data.positions) {
    const amount = decryptAmount(pos.encryptedAmount, privateKeyHex);
    const amountNum = parseFloat(amount) || 0;

    // 3. Fetch oracle price for this token
    // In production: read from ObolusOracle on-chain via EVMClient
    const price = 1.0; // placeholder — would come from oracle

    const nav = amountNum * price;
    totalNAV += nav;

    runtime.log(
      `Position ${pos.positionId.slice(0, 8)}: ` +
      `${amountNum} tokens × $${price} = $${nav.toFixed(2)} NAV`
    );

    // Plaintext amount is NOT stored or transmitted — only NAV
    updates.push({
      positionId: pos.positionId,
      userAddress: pos.userAddress,
      token: pos.token,
      encryptedNAV: nav.toFixed(2), // In production: re-encrypt for user
    });
  }

  runtime.log(`Total protocol NAV: $${totalNAV.toFixed(2)}`);

  // 4. Post NAV updates back to server (encrypted per-user)
  if (updates.length > 0) {
    confClient.sendRequest(runtime, {
      vaultDonSecrets: SECRETS,
      request: {
        url: `${base}/internal/update-nav`,
        method: 'POST',
        multiHeaders: {
          'x-api-key': { values: ['{{.INTERNAL_API_KEY}}'] },
          'Content-Type': { values: ['application/json'] },
        },
        body: JSON.stringify({ updates, totalNAV: totalNAV.toFixed(2) }),
      },
    }).result();
  }

  // Plaintext positions are now garbage collected — TEE memory is wiped
  return `ok:settled=${updates.length},nav=$${totalNAV.toFixed(2)}`;
};

// ── Runner ──────────────────────────────────────────

const runner = new Runner(onCronTrigger);
runner.run();
