"use client"

import { useState, useEffect } from "react"
import {
    Database,
    TrendingUp,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Verified,
    Coins,
    Search,
    Globe,
    Activity,
    Cpu,
    ArrowUpCircle,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Info
} from "lucide-react"
import Link from "next/link"
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useSwitchChain,
    useReadContract
} from "wagmi"
import { parseUnits, erc20Abi } from "viem"
import { collateralVaultAbi, bnplRouterAbi } from "@/generated"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PoolsPage() {
    const { address, isConnected, chainId: currentChainId } = useAccount()
    const { switchChain } = useSwitchChain()

    const [filter, setFilter] = useState("");
    const [pools, setPools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Deposit State
    const [selectedPool, setSelectedPool] = useState<any>(null);
    const [depositAmount, setDepositAmount] = useState("");
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()

    const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    useEffect(() => {
        async function fetchPools() {
            try {
                const response = await fetch('/api/pools');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setPools(data);
                }
            } catch (error) {
                console.error("Failed to fetch pools:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPools();
    }, []);

    // Check Allowance for selected pool
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: selectedPool?.asset_address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address!, selectedPool?.contract_address as `0x${string}`],
        query: { enabled: !!address && !!selectedPool }
    })

    const filteredPools = pools.filter(p =>
        p.chain_name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.asset_symbol?.toLowerCase().includes(filter.toLowerCase())
    );

    const totalTvl = pools.reduce((acc, p) => acc + Number(p.tvl), 0);
    const avgApy = pools.length > 0 ? (pools.reduce((acc, p) => acc + Number(p.apy), 0) / pools.length).toFixed(2) : "0.00";

    const handleOpenDeposit = (pool: any) => {
        setSelectedPool(pool);
        setIsDepositModalOpen(true);
        setDepositAmount("");
    };

    const handleAction = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (currentChainId !== selectedPool.chain_id) {
            switchChain({ chainId: selectedPool.chain_id });
            return;
        }

        if (!depositAmount || isNaN(Number(depositAmount))) {
            toast.error("Please enter a valid amount");
            return;
        }

        const amount = parseUnits(depositAmount, 18); // Generalizing to 18 for now, ideally fetch from ERC20

        try {
            // Step 1: Check Allowance
            if (!allowance || allowance < amount) {
                toast.info(`Approving ${selectedPool.asset_symbol}...`);
                writeContract({
                    address: selectedPool.asset_address as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [selectedPool.contract_address as `0x${string}`, amount],
                });
                return;
            }

            // Step 2: Deposit
            toast.info(`Depositing into ${selectedPool.chain_name}...`);
            if (selectedPool.pool_type === 'MASTER') {
                writeContract({
                    address: selectedPool.contract_address as `0x${string}`,
                    abi: bnplRouterAbi,
                    functionName: 'addLiquidity',
                    args: [amount],
                });
            } else {
                writeContract({
                    address: selectedPool.contract_address as `0x${string}`,
                    abi: collateralVaultAbi,
                    functionName: 'deposit',
                    args: [selectedPool.asset_address as `0x${string}`, amount],
                });
            }
        } catch (err: any) {
            toast.error(err.message || "Transaction failed");
        }
    };

    useEffect(() => {
        if (isTxSuccess) {
            toast.success("Transaction confirmed!");
            setIsDepositModalOpen(false);
            // Refresh pools TVL info
            fetch('/api/pools').then(r => r.json()).then(setPools);
        }
    }, [isTxSuccess]);

    return (
        <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-background relative overflow-x-hidden">
            {/* Background Layer */}
            <div className="terminal-grid" />

            <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 md:px-12 bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-6 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="sr-only">Obolus</h2>
                        <img src="/logo.png" alt="Obolus Logo" className="h-6 w-auto object-contain" />
                    </div>
                    <nav className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest font-mono">
                        <Link className="text-primary border-b border-primary/40 pb-1" href="/terminal">TERMINAL</Link>
                        <Link className="text-white/40 hover:text-white transition-colors" href="/pools">POOLS</Link>
                        <Link className="text-white/40 hover:text-white transition-colors" href="#">NETWORK</Link>
                        <Link className="text-white/40 hover:text-white transition-colors" href="#">SECURITY</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-sm">
                        <Activity className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest leading-none">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "NOT_CONNECTED"}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-6 max-w-full mx-auto w-full relative z-10 font-mono">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-lg p-5 border-l-2 border-l-primary/40 relative group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                                Total_Value_Locked
                                <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <Database className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">
                                ${totalTvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-[10px] text-primary/60 mb-1">SYNCED</span>
                        </div>
                        <div className="absolute top-12 left-5 bg-black/90 border border-white/10 p-2 rounded text-[8px] text-white/60 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity max-w-[200px]">
                            Protocol metrics are synced from the blockchain every cycle into the Obolus Registry for optimized performance.
                        </div>
                    </div>
                    <div className="glass-card rounded-lg p-5 border-l-2 border-l-primary/40">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Average_Pool_APY</span>
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">{avgApy}%</span>
                            <span className="text-[10px] text-white/40 mb-1">STABLE</span>
                        </div>
                    </div>
                    <div className="glass-card rounded-lg p-5 border-l-2 border-l-primary/40">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Active_Chains</span>
                            <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white">{pools.length}</span>
                            <span className="text-[10px] text-white/40 mb-1">NODES</span>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <div className="flex flex-col gap-1 mb-2">
                    <span className="text-[10px] tracking-[0.4em] text-primary/60 uppercase">Liquidity_Engine // Pool_Management</span>
                    <div className="flex justify-between items-end">
                        <h1 className="text-white text-2xl tracking-tighter font-bold uppercase">POOLS_TERMINAL_V1.4</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-white/5 border border-white/10 p-1 rounded">
                                <button className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-bold rounded-sm border border-primary/20">ALL_NETWORKS</button>
                                <button className="px-3 py-1 text-white/40 hover:text-white text-[9px] font-bold">AVAX</button>
                                <button className="px-3 py-1 text-white/40 hover:text-white text-[9px] font-bold">BASE</button>
                            </div>
                            <button className="size-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors">
                                <RefreshCw className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="glass-card rounded-lg border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-[11px] text-white font-bold uppercase tracking-widest">Primary_Liquidity_Matrix</span>
                            <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full border border-primary/20">
                                {filteredPools.length} ACTIVE POOLS
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] text-white/30 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                <input
                                    type="text"
                                    placeholder="SEARCH_MANIFEST..."
                                    className="bg-transparent border-none p-0 focus:ring-0 placeholder:text-white/10 w-32 font-mono text-[9px]"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                            <span className="text-primary/40">● Live_Sync_Enabled</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="py-5 px-6 text-[10px] text-white/40 uppercase tracking-widest font-bold">Asset</th>
                                    <th className="py-5 px-6 text-[10px] text-white/40 uppercase tracking-widest font-bold">Network</th>
                                    <th className="py-5 px-6 text-[10px] text-white/40 uppercase tracking-widest font-bold text-right">Total_Value_Locked</th>
                                    <th className="py-5 px-6 text-[10px] text-white/40 uppercase tracking-widest font-bold text-right">Variable_APY</th>
                                    <th className="py-5 px-6 text-[10px] text-white/40 uppercase tracking-widest font-bold text-center">Protocol_Risk</th>
                                    <th className="py-5 px-6 text-[10px] text-white/40 uppercase tracking-widest font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                                                <span className="text-[10px] uppercase tracking-[0.3em]">Syncing_Global_State...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPools.map((pool) => (
                                    <tr key={pool.id} className="hover:bg-primary/[0.03] transition-colors group">
                                        <td className="py-6 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <Coins className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-xs font-bold uppercase">{pool.asset_symbol} Pool</span>
                                                    <span className="text-[9px] text-white/30 truncate max-w-[150px]">
                                                        {pool.contract_address || "DEPLOYING..."}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`size-1.5 rounded-full ${pool.pool_type === 'MASTER' ? 'bg-primary' : 'bg-blue-500'}`} />
                                                <span className="text-[10px] text-white/60 uppercase">{pool.chain_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 text-right text-xs text-white/80 font-mono">
                                            <div className="flex flex-col items-end">
                                                <span>${Number(pool.tvl).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                {pool.is_live && <span className="text-[8px] text-primary/60 uppercase tracking-tighter mt-0.5">● On-Chain</span>}
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 text-right text-xs text-primary font-bold">
                                            {pool.apy}%
                                        </td>
                                        <td className="py-6 px-6">
                                            <div className="flex justify-center">
                                                <span className={`text-[9px] px-2 py-0.5 border uppercase tracking-tighter rounded-sm ${pool.pool_type === 'MASTER'
                                                    ? 'bg-primary/10 text-primary border-primary/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {pool.pool_type === 'MASTER' ? "LOW_RISK" : "OPTIMAL"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 text-right">
                                            <button
                                                onClick={() => handleOpenDeposit(pool)}
                                                className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold uppercase tracking-widest px-4 py-2 transition-all rounded-sm disabled:opacity-50"
                                                disabled={!pool.contract_address}
                                            >
                                                {pool.pool_type === 'MASTER' ? "DEPOSIT" : "DEPOSIT"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white/5 px-6 py-3 border-t border-white/10 flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-4">
                            <span className="text-white/40 uppercase">MASTER_NODE_OK</span>
                            <div className="flex gap-2 text-white/20">
                                <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-white" />
                                <ChevronRight className="w-4 h-4 cursor-pointer hover:text-white" />
                            </div>
                        </div>
                        <div className="text-white/20 uppercase tracking-widest">
                            SYSTEM_LATENCY: 14ms // ENGINE_STATUS: STABLE
                        </div>
                    </div>
                </div>
            </main>

            <footer className="flex flex-col md:flex-row justify-between items-center py-6 px-6 md:px-12 border-t border-white/5 gap-6 opacity-40 font-mono">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="size-1 bg-primary rounded-full neon-glow"></span>
                        Obolus_NETWORK: ONLINE
                    </div>
                    <div className="text-[10px] flex items-center gap-1 font-bold uppercase tracking-[0.2em]">
                        <Verified className="w-3 h-3 text-primary" />
                        TERMINAL_SESSION_ACTIVE
                    </div>
                </div>
                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <Link className="hover:text-primary transition-colors" href="#">Support</Link>
                    <Link className="hover:text-primary transition-colors" href="#">Docs</Link>
                    <Link className="hover:text-primary transition-colors" href="#">Privacy</Link>
                </div>
            </footer>

            {/* Deposit Modal */}
            <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
                <DialogContent className="bg-[#070B12] border border-white/10 font-mono text-foreground sm:max-w-[400px]">
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    <DialogHeader>
                        <DialogTitle className="text-white uppercase tracking-widest flex items-center gap-2">
                            <Coins className="w-5 h-5 text-primary" />
                            Provision_Liquidity
                        </DialogTitle>
                        <DialogDescription className="text-white/40 text-[10px] uppercase tracking-wider">
                            Vault: {selectedPool?.chain_name} // Asset: {selectedPool?.asset_symbol}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4 relative z-10">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 px-1">
                                <span>Input_Amount</span>
                                <span>Available: --</span>
                            </div>
                            <div className="relative">
                                <Input
                                    className="bg-white/5 border-white/10 rounded-none h-14 text-lg font-bold text-white focus-visible:ring-primary/20 placeholder:text-white/5"
                                    placeholder="0.00"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary">
                                    {selectedPool?.asset_symbol}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 p-4 space-y-3">
                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                <span className="text-white/40">Expected_APY</span>
                                <span className="text-primary">{selectedPool?.apy}%</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                <span className="text-white/40">Network_Latency</span>
                                <span className="text-white/80">LOW</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                <span className="text-white/40">Status</span>
                                <span className="text-emerald-500">READY</span>
                            </div>
                        </div>

                        {writeError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <span className="text-[10px] text-rose-500 uppercase leading-snug">
                                    {writeError.message.includes('User rejected') ? "TRANSACTION_REJECTED" : "TRANSACTION_FAILED: " + writeError.message.slice(0, 50)}
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            className="w-full bg-primary text-background font-black uppercase tracking-widest h-12 rounded-none hover:bg-primary/90 transition-all group overflow-hidden relative"
                            onClick={handleAction}
                            disabled={isWritePending || isWaitingForTx}
                        >
                            {(isWritePending || isWaitingForTx) ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{isWaitingForTx ? "CONFIRMING..." : "PENDING..."}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <ArrowUpCircle className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                    <span>{allowance && allowance >= parseUnits(depositAmount || "0", 18) ? "EXECUTE_DEPOSIT" : "APPROVE_ASSET"}</span>
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

