export function MapSection() {
  return (
    <section id="map" className="relative py-20 md:py-32 animate-on-scroll bg-[#0B0C0F]">
      <div className="text-center mb-12 md:mb-16 px-4">
        <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-[#A7ABB3] mb-6 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          PIPELINE FOOTPRINT
        </div>
        <h2 className="font-serif text-[32px] leading-[1.15] md:text-[48px] md:leading-[1.1] font-medium mb-6 text-balance">
          Data pipelines across environments
        </h2>
        <p className="text-[#A7ABB3] text-sm md:text-base max-w-[600px] mx-auto leading-relaxed">
          Visualize where your data is coming from and how it flows through your stack – from source databases and APIs
          to downstream destinations.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "01", title: "Connect", desc: "Securely connect production databases, warehouses, and APIs with schema discovery and health checks." },
            { label: "02", title: "Model", desc: "Define pipelines, transformations, and datasets with version control and collaboration." },
            { label: "03", title: "Orchestrate", desc: "Schedule and trigger syncs, monitor SLAs, and handle failures with automatic retries." },
            { label: "04", title: "Serve", desc: "Expose trusted datasets to BI tools, APIs, and downstream systems with governance." },
          ].map((stage) => (
            <div key={stage.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-[#A7ABB3] mb-3">{stage.label}</div>
              <h3 className="text-lg md:text-xl font-medium mb-2">{stage.title}</h3>
              <p className="text-sm text-[#A7ABB3] leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


