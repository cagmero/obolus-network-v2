"use client"

// Dynamically import fhevmjs to avoid server-side IDB/localStorage errors
let instance: any = null;

// Zama Devnet fhEVM Addresses (from hardhat.config.ts)
const FHEVM_CONFIG = {
  aclContractAddress: "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
  kmsContractAddress: "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
};

/**
 * Get the FHEVM instance, initializing it if necessary on the client side.
 */
export const getInstance = async () => {
  if (typeof window === "undefined") return null;
  if (instance) return instance;
  
  try {
    const { initFhevm, createInstance } = await import("fhevmjs");
    await initFhevm();
    
    // Check if ethereum is available in the window object (from Metamask/other wallet)
    if (typeof (window as any).ethereum !== "undefined") {
      instance = await createInstance({
        network: (window as any).ethereum,
        ...FHEVM_CONFIG
      });
    }
    
    return instance;
  } catch (error) {
    console.error("Failed to initialize FHEVM instance:", error);
    return null;
  }
};

/**
 * Encrypt a value for FHE operations.
 */
export const encrypt64 = async (value: number | bigint) => {
  const fhevminstance = await getInstance();
  if (!fhevminstance) throw new Error("FHEVM_NOT_INITIALIZED");

  const input = fhevminstance.createEncryptedInput(
    "0x0000000000000000000000000000000000000000", // placeholder
    "0x0000000000000000000000000000000000000000"  // placeholder
  );
  input.add64(value);
  const encrypted = await input.encrypt();
  return encrypted.handles[0]; // Usually we want the handle
};
