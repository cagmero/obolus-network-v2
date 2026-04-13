import { usePrivy } from "@privy-io/react-auth"
import Link from "next/link"

export function LandingPage() {
    const { login } = usePrivy()

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden -mt-24">
            <div className="fixed inset-0 grid-bg pointer-events-none"></div>
            <div className="fixed top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-[1200px] h-[1200px] flex items-center justify-center">
                        <svg className="circular-text" viewBox="0 0 1000 1000">
                            <path d="M 500, 500 m -400, 0 a 400,400 0 1,1 800,0 a 400,400 0 1,1 -800,0" fill="transparent" id="circlePath"></path>
                            <text className="text-ring">
                                <textPath xlinkHref="#circlePath">
                                    INSTITUTIONAL PRIVACY PROTOCOL • OBOLUS • INSTITUTIONAL PRIVACY PROTOCOL •
                                </textPath>
                            </text>
                        </svg>
                        <div className="core-container relative flex items-center justify-center">
                            <div className="orb-wrapper flex items-center justify-center w-96 h-96">
                                <div className="ring ring-1"></div>
                                <div className="ring ring-2"></div>
                                <div className="ring ring-3"></div>
                                <div className="ring ring-4"></div>
                                <div className="core-data-center"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1 h-1 bg-primary rounded-full absolute top-1/4 left-1/2 blur-[1px]"></div>
                                    <div className="w-1 h-1 bg-primary rounded-full absolute bottom-1/4 right-1/2 blur-[1px]"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/4 blur-[2px] opacity-60"></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full absolute top-1/2 right-1/4 blur-[2px] opacity-80"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[1400px] px-6 flex flex-col items-center relative z-20">
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
                            <p className="text-[10px] font-mono tracking-[0.4em] text-primary uppercase">Protocol_Heartbeat_v1.0</p>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 italic uppercase font-display">
                            Obolus PROTOCOL
                        </h1>
                        <p className="text-slate-200 font-mono text-lg tracking-widest uppercase max-w-3xl mx-auto mb-4">
                            Privacy-Preserving RWA Yield and Credit Layer.
                        </p>
                        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase max-w-2xl mx-auto">
                            Shield your portfolio metadata on BNB Chain. Deploy institutional-grade RWA strategies with complete privacy.
                        </p>
                    </div>

                    <div className="bg-[#05080f]/80 border border-primary/20 backdrop-blur-xl p-8 rounded-2xl text-center shadow-2xl mb-12 max-w-md w-full">
                        <div className="flex gap-8 justify-center">
                            <div className="text-left font-mono">
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Vault_Privacy</p>
                                <p className="text-xl font-bold text-primary">ECIES / TEE</p>
                            </div>
                            <div className="border-l border-white/10"></div>
                            <div className="text-left font-mono">
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest">CRE_Status</p>
                                <p className="text-xl font-bold text-white uppercase">ACTIVE</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <button
                            onClick={() => {
                                console.log("LandingPage: LAUNCH TERMINAL clicked, calling privy login()")
                                login()
                            }}
                            className="bg-primary text-black px-12 py-5 rounded-xl font-bold text-xl hover:brightness-110 transition-all neon-glow min-w-[280px] font-mono uppercase tracking-tighter"
                        >
                            LAUNCH TERMINAL
                        </button>
                        <button className="bg-[#121a2a]/80 border border-slate-700 text-white px-12 py-5 rounded-xl font-bold text-xl hover:bg-[#121a2a] transition-all min-w-[280px] backdrop-blur-md font-mono uppercase tracking-tighter">
                            VIEW ECOSYSTEM
                        </button>
                    </div>
                </div>
            </main>

            <section className="relative z-10 pt-48 pb-24 px-6 text-center">
                <div className="max-w-6xl mx-auto">
                    <div className="p-12 md:p-20 rounded-[3rem] bg-[#0a0f1a]/40 border border-white/5 backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                        <p className="text-sm font-mono tracking-[0.5em] text-slate-500 font-bold uppercase mb-8">Cumulative_Protocol_Metrics</p>
                        <div className="flex flex-col items-center mb-16">
                            <div className="relative inline-block font-display font-black">
                                <h2 className="text-8xl md:text-[12rem] font-bold text-white tracking-tighter neon-text leading-none uppercase italic">
                                    $15,240,192
                                </h2>
                                <div className="absolute -top-4 -right-20 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-lg text-primary text-lg font-bold font-mono">
                                    +12.5%
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl text-primary font-bold uppercase tracking-[0.3em] mt-8 font-mono italic">TOTAL PROTOCOL TVL</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-white/10 pt-16 font-mono">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm tracking-widest text-slate-500 font-bold uppercase">Privacy_Vaults</p>
                                <p className="text-4xl font-bold text-white tracking-tighter">1,202</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm tracking-widest text-slate-500 font-bold uppercase">RWA_Capital</p>
                                <p className="text-4xl font-bold text-white tracking-tighter">$8,240,290</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm tracking-widest text-slate-500 font-bold uppercase">Privacy_Score</p>
                                <p className="text-4xl font-bold text-primary tracking-tighter uppercase">99.9%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="mt-auto relative z-50 border-t border-primary/20 bg-black py-6 overflow-hidden">
                <div className="marquee-container">
                    <div className="marquee-content flex gap-20 items-center">
                        <div className="flex gap-8 items-center">
                            <span className="text-primary font-mono text-base font-bold tracking-[0.3em] uppercase">Obolus NETWORK STATUS:</span>
                            <span className="text-white/60 font-mono text-sm uppercase tracking-tighter whitespace-nowrap">RWA_VOLUME: $12.2M</span>
                            <span className="text-white/60 font-mono text-sm uppercase tracking-tighter whitespace-nowrap">LOCKED_EQUITY: TSLAx / AAPLx</span>
                            <span className="text-white/60 font-mono text-sm uppercase tracking-tighter whitespace-nowrap">TOTAL_PROTOCOL_TVL: $15,240,192.00</span>
                            <span className="text-white/60 font-mono text-sm uppercase tracking-tighter whitespace-nowrap">ACTIVE_VAULTS: 1,202</span>
                            <span className="text-white/60 font-mono text-sm uppercase tracking-tighter whitespace-nowrap">CRE_SYNC_HEALTH: 100%</span>
                            <span className="text-primary font-mono text-base font-bold tracking-[0.3em] uppercase ml-20">Obolus NETWORK STATUS:</span>
                            <span className="text-white/60 font-mono text-sm uppercase tracking-tighter whitespace-nowrap">ENCRYPTED_STATE: SYNCED</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
