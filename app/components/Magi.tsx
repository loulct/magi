export default function MagiSystem() {
  return (
    <div className="magi-monitor-fix min-h-screen flex flex-col items-center justify-center p-8 gap-12 select-none">
      <div className="text-center font-mono border border-[#ff6600] px-6 py-2 bg-black/60 tracking-[0.2em] text-xs uppercase shadow-[0_0_10px_rgba(255,102,0,0.2)]">
        Magi // LLM Council
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative">

        <div className="magi-brain magi-approved md:col-span-2 mx-auto md:w-96">
          <div className="magi-header">
            <span>Llama-3.2</span>
            <span className="text-xs bg-[#ff6600]/20 px-2 py-0.5 border border-[#ff6600]">AGREE</span>
          </div>
          <div className="text-xs space-y-1 opacity-90">
            <p className="font-bold">// VERSION: 3B-Instruct-Q4_K_M</p>
            <p className="text-[#ff9955] mt-2">INFO: Optimized for multilingual dialogue use cases, including agentic retrieval and summarization tasks.</p>
          </div>
          <div className="mt-4 text-[9px] opacity-40 font-mono tracking-tighter text-right">
            // OK
          </div>
        </div>

        <div className="magi-brain magi-approved w-full">
          <div className="magi-header">
            <span>LFM2.5-1</span>
            <span className="text-xs bg-[#ff6600]/20 px-2 py-0.5 border border-[#ff6600]">AGREE</span>
          </div>
          <div className="text-xs space-y-1 opacity-90">
            <p className="font-bold">// VERSION: 2B-Instruct-Q4_K_M</p>
            <p className="text-[#ff9955] mt-2">INFO: Multimodal architectures built for fast inference.</p>
          </div>
          <div className="mt-4 text-[9px] opacity-40 font-mono tracking-tighter text-right">
            // OK
          </div>
        </div>

        <div className="magi-brain magi-denied w-full">
          <div className="magi-header text-[#ff0033]">
            <span>Phi-4</span>
            <span className="text-xs bg-[#ff0033]/20 px-2 py-0.5 border border-[#ff0033] animate-pulse">DENIED</span>
          </div>
          <div className="text-xs space-y-1 opacity-90">
            <p className="font-bold text-[#ff4466]">// VERSION: mini-instruct-Q4_K_M</p>
            <p className="text-[#ff6688] mt-2">INFO: Lightweight open model built upon synthetic data and filtered publicly available websites - with a focus on high-quality, reasoning dense data.</p>
          </div>
          <div className="mt-4 text-[9px] opacity-40 font-mono tracking-tighter text-right text-[#ff4466]">
            // ERR
          </div>
        </div>

      </div>

      <div className="text-center font-mono text-[11px] text-[#ff0033] tracking-widest uppercase border-t border-b border-[#ff0033]/30 py-2 w-full max-w-sm">
        INTERMITTENT RESOLUTION: AWAITING UNANIMOUS CONSENSUS
      </div>

    </div>
  );
}

