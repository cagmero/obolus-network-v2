/**
 * Obolus CRE Workflow: Health Monitor
 *
 * Runs every 60 seconds inside the Chainlink CRE (TEE).
 * Reads oracle prices, checks vault health, and triggers
 * rebalancing or alerts if positions are at risk.
 */
import {
  type CronPayload,
  cre,
  Runner,
  type Runtime,
  ok,
  json,
} from '@chainlink/cre-sdk';

// ── Config ──────────────────────────────────────────

export type Config = {
  schedule: string;
  obolusApiUrl: string;
  oracleAddress: string;
  chainId: number;
  rpcUrl: string;
};

// ── Chainlink Price Feed ABI (minimal) ──────────────

const PRICE_FEED_ABI = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ── DON Secrets ─────────────────────────────────────

const SECRETS = [
  { key: 'INTERNAL_API_KEY', namespace: 'obolus-protocol' },
];

// ── CRE Handler ─────────────────────────────────────

const onCronTrigger = async (
  runtime: Runtime<Config>,
  _payload: CronPayload
): Promise<string> => {
  runtime.log('health-monitor triggered');

  const confClient = new cre.capabilities.ConfidentialHTTPClient();
  const base = runtime.config.obolusApiUrl;

  // 1. Read oracle prices via EVMClient
  // In production: use cre.capabilities.EVMClient to read on-chain oracle
  // const evmClient = new cre.capabilities.EVMClient();
  // const price = evmClient.read(runtime, { ... });

  // 2. Fetch pool state from server
  const stateResp = confClient.sendRequest(runtime, {
    vaultDonSecrets: SECRETS,
    request: {
      url: `${base}/internal/pool-health`,
      method: 'GET',
      multiHeaders: {
        'x-api-key': { values: ['{{.INTERNAL_API_KEY}}'] },
      },
    },
  }).result();

  if (!ok(stateResp)) return 'error:fetch-health';

  const health = json(stateResp) as {
    totalShielded: Record<string, string>;
    pendingTransfers: number;
    activePositions: number;
  };

  runtime.log(
    `Pool health: ${health.activePositions} positions, ` +
    `${health.pendingTransfers} pending transfers`
  );

  // 3. Check for anomalies
  // - Pool balance vs sum of shielded positions (should match)
  // - Stale transfers (pending > 5 minutes)
  // - Oracle price staleness

  // 4. If unhealthy, trigger alerts or emergency actions
  // In production: post alerts to server, trigger rebalancing

  return `ok:positions=${health.activePositions},pending=${health.pendingTransfers}`;
};

// ── Runner ──────────────────────────────────────────

const runner = new Runner(onCronTrigger);
runner.run();
