/**
 * Tests for EIP-712 type definitions and signature verification.
 */
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import { OBOLUS_DOMAIN, EIP712_TYPES } from '@/lib/eip712';
import { verifyEIP712Signature } from '@/lib/server/auth';

// Test wallet (DO NOT use in production)
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const account = privateKeyToAccount(TEST_PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: bscTestnet,
  transport: http(),
});

describe('EIP-712 Authentication', () => {

  describe('Domain & Types', () => {
    it('should have correct domain fields', () => {
      expect(OBOLUS_DOMAIN.name).toBe('Obolus Network');
      expect(OBOLUS_DOMAIN.version).toBe('2.0.0');
      expect(OBOLUS_DOMAIN.chainId).toBe(97);
      expect(OBOLUS_DOMAIN.verifyingContract).toMatch(/^0x/);
    });

    it('should define all required EIP-712 types', () => {
      expect(EIP712_TYPES['Shielded Deposit']).toBeDefined();
      expect(EIP712_TYPES['Shield Transfer']).toBeDefined();
      expect(EIP712_TYPES['Shielded Withdraw']).toBeDefined();
      expect(EIP712_TYPES['Privacy Reveal']).toBeDefined();
    });

    it('Shielded Deposit should have correct fields', () => {
      const fields = EIP712_TYPES['Shielded Deposit'];
      const names = fields.map(f => f.name);
      expect(names).toContain('account');
      expect(names).toContain('token');
      expect(names).toContain('amount');
      expect(names).toContain('timestamp');
    });

    it('Privacy Reveal should have correct fields', () => {
      const fields = EIP712_TYPES['Privacy Reveal'];
      const names = fields.map(f => f.name);
      expect(names).toContain('account');
      expect(names).toContain('timestamp');
    });
  });

  describe('Signature Verification', () => {
    it('should verify a valid Shielded Deposit signature', async () => {
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const message = {
        account: account.address,
        token: '0x2B05DC386bbe679fD22eDE500b52B858B86B3778' as `0x${string}`,
        amount: BigInt('1000000000000000000'),
        timestamp,
      };

      const signature = await walletClient.signTypedData({
        domain: OBOLUS_DOMAIN,
        types: { 'Shielded Deposit': EIP712_TYPES['Shielded Deposit'] },
        primaryType: 'Shielded Deposit',
        message,
      });

      const valid = await verifyEIP712Signature({
        primaryType: 'Shielded Deposit',
        message,
        signature,
        expectedSigner: account.address,
      });

      expect(valid).toBe(true);
    });

    it('should verify a valid Privacy Reveal signature', async () => {
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const message = {
        account: account.address,
        timestamp,
      };

      const signature = await walletClient.signTypedData({
        domain: OBOLUS_DOMAIN,
        types: { 'Privacy Reveal': EIP712_TYPES['Privacy Reveal'] },
        primaryType: 'Privacy Reveal',
        message,
      });

      const valid = await verifyEIP712Signature({
        primaryType: 'Privacy Reveal',
        message,
        signature,
        expectedSigner: account.address,
      });

      expect(valid).toBe(true);
    });

    it('should verify a valid Shielded Withdraw signature', async () => {
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const message = {
        account: account.address,
        token: '0x2B05DC386bbe679fD22eDE500b52B858B86B3778' as `0x${string}`,
        shares: BigInt('500000000000000000'),
        timestamp,
      };

      const signature = await walletClient.signTypedData({
        domain: OBOLUS_DOMAIN,
        types: { 'Shielded Withdraw': EIP712_TYPES['Shielded Withdraw'] },
        primaryType: 'Shielded Withdraw',
        message,
      });

      const valid = await verifyEIP712Signature({
        primaryType: 'Shielded Withdraw',
        message,
        signature,
        expectedSigner: account.address,
      });

      expect(valid).toBe(true);
    });

    it('should reject a signature from wrong signer', async () => {
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const message = {
        account: account.address,
        timestamp,
      };

      const signature = await walletClient.signTypedData({
        domain: OBOLUS_DOMAIN,
        types: { 'Privacy Reveal': EIP712_TYPES['Privacy Reveal'] },
        primaryType: 'Privacy Reveal',
        message,
      });

      // Verify against a different address
      const valid = await verifyEIP712Signature({
        primaryType: 'Privacy Reveal',
        message,
        signature,
        expectedSigner: '0x0000000000000000000000000000000000000001',
      });

      expect(valid).toBe(false);
    });

    it('should reject a tampered message', async () => {
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const originalMessage = {
        account: account.address,
        token: '0x2B05DC386bbe679fD22eDE500b52B858B86B3778' as `0x${string}`,
        amount: BigInt('1000000000000000000'),
        timestamp,
      };

      const signature = await walletClient.signTypedData({
        domain: OBOLUS_DOMAIN,
        types: { 'Shielded Deposit': EIP712_TYPES['Shielded Deposit'] },
        primaryType: 'Shielded Deposit',
        message: originalMessage,
      });

      // Tamper with the amount
      const tamperedMessage = {
        ...originalMessage,
        amount: BigInt('9999999999999999999'),
      };

      const valid = await verifyEIP712Signature({
        primaryType: 'Shielded Deposit',
        message: tamperedMessage,
        signature,
        expectedSigner: account.address,
      });

      expect(valid).toBe(false);
    });
  });
});
