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
 * Purely client-side dynamic import ensures no SSR side-effects.
 */
export async function encryptPosition(positions: Record<string, string>): Promise<string> {
  if (typeof window === "undefined") return "";
  
  try {
    const { encrypt } = await import('eciesjs')
    const pubKeyHex = await getCrePublicKey()
    const plaintext = JSON.stringify(positions)
    
    const cleanPubKey = pubKeyHex.startsWith("0x") ? pubKeyHex.slice(2) : pubKeyHex
    
    // Using simple Uint8Array if Buffer is unreliable in some browser environments
    const encrypted = encrypt(
       Uint8Array.from(Buffer.from(cleanPubKey, 'hex')), 
       Uint8Array.from(Buffer.from(plaintext))
    )
    return "0x" + Buffer.from(encrypted).toString('hex')
  } catch (err) {
    console.error("Encryption error:", err)
    return ""
  }
}

/**
 * Encrypt a single numeric value (e.g. deposit amount) for the CRE.
 */
export async function encryptAmount(amount: string): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    const { encrypt } = await import('eciesjs')
    const pubKeyHex = await getCrePublicKey()
    const cleanPubKey = pubKeyHex.startsWith("0x") ? pubKeyHex.slice(2) : pubKeyHex

    const encrypted = encrypt(
      Uint8Array.from(Buffer.from(cleanPubKey, 'hex')), 
      Uint8Array.from(Buffer.from(amount))
    )
    return "0x" + Buffer.from(encrypted).toString('hex')
  } catch (err) {
    console.error("Encryption error:", err)
    return ""
  }
}
/**
 * Decrypt a value locally using a signature as the derivation key.
 * In a production setup, the signature would generate a symmetric key (AES) 
 * to decrypt the sensitive blobs from the "Dumb Store."
 */
export async function decryptData(ciphertext: string, signature: string): Promise<string> {
  if (typeof window === "undefined") return ciphertext;
  
  // Simulation: We use the signature as a seed to "unlock" the value.
  // In a real implementation with ECIES/AES, we'd use the signature to derive the private key.
  console.log("[OBOLUS] LOCAL_DECRYPTION_STARTED // Using Signature as derivation seed");
  
  // Wait for the "Decryption" process
  await new Promise(r => setTimeout(r, 1200));
  
  // For the demo, we return the value. 
  // In reality, ciphertext would be hex, and this would return the plaintext.
  return ciphertext; 
}
