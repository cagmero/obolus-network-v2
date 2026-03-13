"use client"

import {
  FolderOpen,
  Wallet,
  CreditCard,
  Gavel,
  Terminal,
  Search,
  Code,
  HelpCircle,
  ChevronRight
} from "lucide-react"

export default function DocsPage() {
  return (
    <div className="flex -mx-4 md:-mx-8 lg:-mx-12 h-[calc(100vh-140px)] overflow-hidden border-t border-white/5 font-display">
      {/* Left Column: Navigation Tree */}
      <aside className="w-72 glass-sidebar flex flex-col custom-scrollbar overflow-y-auto hidden lg:flex bg-background/50">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-white text-sm font-bold tracking-widest font-mono mb-1">_DOCS</h1>
            <p className="text-primary/60 text-[10px] font-mono uppercase tracking-[0.2em]">v2.4.0-STABLE_RELEASE</p>
          </div>
          <nav className="space-y-1">
            <a className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all" href="#">
              <FolderOpen className="text-white/40 group-hover:text-primary size-4" />
              <p className="text-white/60 group-hover:text-white text-[11px] font-mono tracking-tighter">01_GETTING_STARTED</p>
            </a>
            <a className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all" href="#">
              <Wallet className="text-white/40 group-hover:text-primary size-4" />
              <p className="text-white/60 group-hover:text-white text-[11px] font-mono tracking-tighter">02_STAKING_LOGIC</p>
            </a>
            <a className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(167,242,74,0.1)]" href="#">
              <CreditCard className="text-primary size-4" />
              <p className="text-primary text-[11px] font-mono tracking-tighter neon-glow">03_GLOBAL_PAYMENTS</p>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            </a>
            <div className="pl-8 flex flex-col gap-1 mt-1 border-l border-white/5 ml-5">
              <a className="text-white/40 hover:text-primary text-[10px] font-mono py-1 transition-colors uppercase" href="#">BNPL_MECHANICS</a>
              <a className="text-white/40 hover:text-primary text-[10px] font-mono py-1 transition-colors uppercase" href="#">INTEREST_MODELS</a>
              <a className="text-white/40 hover:text-primary text-[10px] font-mono py-1 transition-colors uppercase" href="#">REPAYMENT_FLOW</a>
            </div>
            <a className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all" href="#">
              <Gavel className="text-white/40 group-hover:text-primary size-4" />
              <p className="text-white/60 group-hover:text-white text-[11px] font-mono tracking-tighter">04_LIQUIDATION_PROTOCOL</p>
            </a>
            <a className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all" href="#">
              <Terminal className="text-white/40 group-hover:text-primary size-4" />
              <p className="text-white/60 group-hover:text-white text-[11px] font-mono tracking-tighter">05_DEVELOPER_API</p>
            </a>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/5">
          <button className="w-full flex items-center justify-center gap-2 border border-primary/40 text-primary px-4 py-2.5 rounded-lg text-xs font-mono hover:bg-primary/10 transition-all uppercase tracking-tighter">
            <Code className="size-3" />
            API_REFERENCE
          </button>
        </div>
      </aside>

      {/* Center Column: Main Content */}
      <main className="flex-1 custom-scrollbar overflow-y-auto bg-background/20">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-8 font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">
            <a className="hover:text-primary transition-colors" href="#">ROOT</a>
            <ChevronRight className="size-2 text-white/20" />
            <a className="hover:text-primary transition-colors" href="#">03_BNPL_REPAYMENTS</a>
            <ChevronRight className="size-2 text-white/20" />
            <span className="text-primary/70">BNPL_MECHANICS</span>
          </div>

          {/* Page Heading */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-6 text-white uppercase italic">
              DOC_MANIFEST <span className="text-primary">//</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">BNPL_MECHANICS</span>
            </h1>
            <p className="text-white/50 text-base font-mono leading-relaxed max-w-2xl uppercase tracking-tight">
              Technical specifications for the global payments protocol. This module governs automated merchant settlements and stablecoin payment flows.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 pb-24">
            <section id="ltv-ratios">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-primary font-mono text-sm">[1.1]</span>
                <h3 className="text-2xl font-bold tracking-tight uppercase italic">CREDIT_CALCULATION</h3>
              </div>
              <p className="text-white/60 font-mono text-xs leading-relaxed mb-6 uppercase tracking-wide">
                The payment engine calculates real-time settlement availability based on the transaction volume and merchant reputation. The standard formula incorporates the Trust Score (ITS).
              </p>

              {/* Terminal Code Block */}
              <div className="terminal-block rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">bash — -cli</span>
                </div>
                <div className="p-5 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  <div className="flex gap-4">
                    <span className="text-white/20 select-none">1</span>
                    <span className="text-primary"></span>
                    <span className="text-white uppercase">query-credit --user</span>
                    <span className="text-[#f1fa8c]">0x71C...392b</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-white/20 select-none">2</span>
                    <span className="text-white/40 italic">// Fetching current collateral health...</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-white/20 select-none">3</span>
                    <span className="text-white">{"{"}</span>
                  </div>
                  <div className="flex gap-4 mt-1 pl-4">
                    <span className="text-white/20 select-none">4</span>
                    <span className="text-[#8be9fd]">"available_credit"</span><span className="text-white">:</span>
                    <span className="text-[#bd93f9]">4520.45</span><span className="text-white">,</span>
                  </div>
                  <div className="flex gap-4 mt-1 pl-4">
                    <span className="text-white/20 select-none">5</span>
                    <span className="text-[#8be9fd]">"ltv_ratio"</span><span className="text-white">:</span>
                    <span className="text-[#bd93f9]">0.65</span><span className="text-white">,</span>
                  </div>
                  <div className="flex gap-4 mt-1 pl-4">
                    <span className="text-white/20 select-none">6</span>
                    <span className="text-[#8be9fd]">"status"</span><span className="text-white">:</span>
                    <span className="text-[#50fa7b]">"HEALTHY"</span>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-white/20 select-none">7</span>
                    <span className="text-white">{"}"}</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="collateral-health">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-primary font-mono text-sm">[1.2]</span>
                <h3 className="text-2xl font-bold tracking-tight uppercase italic">COLLATERAL_HEALTH</h3>
              </div>
              <p className="text-white/60 font-mono text-xs leading-relaxed mb-4 uppercase tracking-wide">
                Settlement health is monitored block-by-block via the Oracle Network.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/20 transition-all group">
                  <h4 className="text-primary font-mono text-[9px] mb-2 font-bold tracking-[0.2em]">THRESHOLD_01</h4>
                  <p className="text-white text-xs font-bold font-mono group-hover:text-primary transition-colors uppercase">SAFE: 0.0 - 0.70 LTV</p>
                  <p className="text-white/40 text-[10px] mt-1 font-mono uppercase">No action required. Rewards accumulating.</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-yellow-500/20 transition-all group">
                  <h4 className="text-yellow-400 font-mono text-[9px] mb-2 font-bold tracking-[0.2em]">THRESHOLD_02</h4>
                  <p className="text-white text-xs font-bold font-mono group-hover:text-yellow-400 transition-colors uppercase">WARNING: 0.71 - 0.84 LTV</p>
                  <p className="text-white/40 text-[10px] mt-1 font-mono uppercase">Notification sent. Auto-repay trigger active.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Right Column: Quick Links */}
      <aside className="w-64 glass-sidebar p-6 hidden xl:flex flex-col overflow-y-auto">
        <div className="sticky top-0 h-full flex flex-col">
          <h5 className="text-white/40 text-[9px] font-mono tracking-[0.3em] uppercase mb-6">IN_THIS_SECTION</h5>
          <ul className="space-y-4 flex-1">
            <li>
              <a className="group block" href="#ltv-ratios">
                <p className="text-[10px] font-mono text-white/60 group-hover:text-primary transition-colors mb-1 font-bold uppercase">CREDIT_CALC</p>
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary/40 group-hover:w-full transition-all duration-500"></div>
                </div>
              </a>
            </li>
            <li>
              <a className="group block" href="#collateral-health">
                <p className="text-[10px] font-mono text-white/60 group-hover:text-primary transition-colors mb-1 font-bold uppercase">COLLATERAL_HEALTH</p>
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full transition-all duration-500 bg-primary/40"></div>
                </div>
              </a>
            </li>
          </ul>

          <div className="mt-8 p-4 rounded-xl terminal-block relative group cursor-pointer overflow-hidden mb-6">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <HelpCircle className="text-primary size-4 mb-2" />
              <h6 className="text-white font-mono text-[10px] mb-1 font-bold uppercase tracking-wider">NEED_ASSISTANCE?</h6>
              <p className="text-white/40 text-[9px] font-mono uppercase tracking-tight">Access our dev community on Discord for real-time support.</p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#a7f24a] animate-pulse"></span>
              <span className="text-[9px] font-mono text-primary font-bold tracking-widest uppercase">SYSTEM_OPERATIONAL</span>
            </div>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">BLOCK_HEIGHT: 18,245,091</p>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">LATENCY: 12ms</p>
          </div>
        </div>
      </aside>
    </div>
  )
}

