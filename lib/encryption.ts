import { encrypt } from 'eciesjs'

/**
 * Fetch the CRE public key from the Obolus Server.
 */
export async function getCrePublicKey(): Promise<string> {
  const res = await fetch('http://localhost:3001/api/v1/cre-public-key')
  const { publicKey } = await res.json()
  return publicKey
}

/**
 * Encrypt a position record (token balances) for the CRE using ECIES.
 * Pattern follows Ghost Finance (0x-prefixed hex).
 */
export async function encryptPosition(positions: Record<string, string>): Promise<string> {
  const pubKeyHex = await getCrePublicKey()
  const plaintext = JSON.stringify(positions)
  
  // Remove "0x" if present in pubKey
  const cleanPubKey = pubKeyHex.startsWith("0x") ? pubKeyHex.slice(2) : pubKeyHex
  
  const encrypted = encrypt(Buffer.from(cleanPubKey, 'hex'), Buffer.from(plaintext))
  return "0x" + Buffer.from(encrypted).toString('hex')
}

/**
 * Encrypt a single numeric value (e.g. deposit amount) for the CRE.
 */
export async function encryptAmount(amount: string): Promise<string> {
  const pubKeyHex = await getCrePublicKey()
  const cleanPubKey = pubKeyHex.startsWith("0x") ? pubKeyHex.slice(2) : pubKeyHex
  const encrypted = encrypt(Buffer.from(cleanPubKey, 'hex'), Buffer.from(amount))
  return "0x" + Buffer.from(encrypted).toString('hex')
}
