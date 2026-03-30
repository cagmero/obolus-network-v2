/**
 * EIP-712 Typed Data definitions for Obolus Protocol.
 * All user-facing server actions require a signed EIP-712 message.
 */

export const OBOLUS_DOMAIN = {
  name: 'Obolus Network',
  version: '2.0.0',
  chainId: 97, // BSC Testnet
  verifyingContract: '0x772C9513fFcffaed224048b3e22AcF9E58854b73' as `0x${string}`, // RWAVault
} as const;

export const EIP712_TYPES = {
  /** Deposit tokens into the shielded vault */
  'Shielded Deposit': [
    { name: 'account', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' },
  ],
  /** Transfer tokens to pool wallet (shield step) */
  'Shield Transfer': [
    { name: 'account', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' },
  ],
  /** Withdraw from shielded vault */
  'Shielded Withdraw': [
    { name: 'account', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'shares', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' },
  ],
  /** Request privacy reveal of own positions */
  'Privacy Reveal': [
    { name: 'account', type: 'address' },
    { name: 'timestamp', type: 'uint256' },
  ],
} as const;

export type EIP712TypeName = keyof typeof EIP712_TYPES;
