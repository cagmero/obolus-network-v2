import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";

let instance: FhevmInstance | null = null;

export const getInstance = async () => {
  if (instance) return instance;
  
  await initFhevm();
  
  // For Zama Devnet, we can fetch the public key from the network
  // In a real app, you might hardcode or fetch it from an environmental variable
  instance = await createInstance({
    network: window.ethereum,
    // Note: In some versions of fhevmjs, you need to provide the public key explicitly
    // if it's not available via the window.ethereum provider's custom methods.
  });
  
  return instance;
};

export const encrypt64 = async (value: number | bigint) => {
  const fhevminstance = await getInstance();
  const input = fhevminstance.createEncryptedInput(
    "0x0000000000000000000000000000000000000000", // placeholder for contract address if not strictly needed for trivial encryption
    "0x0000000000000000000000000000000000000000"  // placeholder for user address
  );
  input.add64(value);
  return await input.encrypt();
};
