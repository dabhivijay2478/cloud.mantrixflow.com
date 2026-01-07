import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative py-24 md:py-40 px-4 animate-on-scroll overflow-hidden pt-0"
      style={{
        backgroundImage: `url('/earth-cta.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0F] via-[#0B0C0F]/60 to-transparent pointer-events-none" />
      <div className="max-w-[800px] w-full mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 glass-pill px-4 py-2 rounded-full mb-8 text-xs md:text-sm text-[#A7ABB3]">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          Ship better data, faster
        </div>

        <h2 className="font-serif text-[40px] leading-[1.15] md:text-[64px] md:leading-[1.1] font-medium mb-6 text-balance">
          Bring order to your data pipelines
        </h2>
        <p className="text-[#A7ABB3] text-base md:text-lg mb-10 leading-relaxed max-w-[560px] mx-auto">
          Connect PostgreSQL, define pipelines, and monitor every run from a single control plane. No more spreadsheets
          and ad‑hoc scripts.
        </p>

        <Button className="glass-button text-base rounded-full bg-white/5 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-white px-8 py-6 md:text-base">
          Get started with MantrixFlow
        </Button>
      </div>
    </section>
  )
}


