/**
 * EIP-712 signature verification for server-side routes.
 */
import { verifyTypedData } from 'viem';
import { OBOLUS_DOMAIN, EIP712_TYPES, type EIP712TypeName } from '@/lib/eip712';

interface VerifyParams {
  primaryType: EIP712TypeName;
  message: Record<string, unknown>;
  signature: string;
  expectedSigner: string;
}

export async function verifyEIP712Signature({
  primaryType,
  message,
  signature,
  expectedSigner,
}: VerifyParams): Promise<boolean> {
  try {
    const valid = await verifyTypedData({
      address: expectedSigner as `0x${string}`,
      domain: OBOLUS_DOMAIN,
      types: { [primaryType]: EIP712_TYPES[primaryType] },
      primaryType,
      message,
      signature: signature as `0x${string}`,
    });
    return valid;
  } catch (err) {
    console.error('[AUTH:VERIFY]', err);
    return false;
  }
}
