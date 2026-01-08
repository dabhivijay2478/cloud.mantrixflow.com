import { AnimatedCounter } from "@/components/landing/animated-counter"

export function MetricsSection() {
  const metrics = [
    { label: "PIPELINES ORCHESTRATED", value: "2.4K", desc: "active production pipelines", color: "pink" },
    { label: "DATA SOURCES", value: "120+", desc: "connectors across databases, warehouses, and APIs", color: "purple" },
    { label: "ROWS PROCESSED", value: "18M", desc: "rows per hour across workloads", color: "pink" },
    { label: "SUCCESS RATE", value: "99.9%", desc: "pipeline run reliability", color: "purple" },
  ]

  return (
    <section id="metrics" className="relative py-20 md:py-32 px-4 animate-on-scroll md:pt-24 md:pb-20">
      <div className="max-w-[1120px] w-full mx-auto">
        <h2 className="font-serif text-[32px] leading-[1.15] md:text-[48px] md:leading-[1.1] font-medium mb-6 md:mb-8 text-center text-balance">
          Data pipeline{" "}
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            reliability
          </span>{" "}
          at scale
        </h2>

        <p className="text-[#A7ABB3] text-sm md:text-base mb-12 md:mb-16 text-center max-w-[600px] mx-auto leading-relaxed">
          Built for data teams running mission‑critical data workloads. Monitor, orchestrate, and scale pipelines
          across all your connectors with confidence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-[800px] mx-auto">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className="p-6 md:p-10 text-center border border-white/10 border-t-0 border-b border-l-0 border-r-0 md:py-10 md:pb-20"
            >
              <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-[#A7ABB3] mb-4 flex items-center justify-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    metric.color === "pink" ? "bg-pink-400/60" : "bg-purple-400/60"
                  }`}
                />
                {metric.label}
              </div>
              <div className="font-serif text-[48px] md:text-[72px] leading-none font-medium">
                <AnimatedCounter value={metric.value} />
              </div>
              <div className="text-[11px] md:text-xs text-[#A7ABB3] mt-3">{metric.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


