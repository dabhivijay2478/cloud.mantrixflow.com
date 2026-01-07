import { PawPrint, Satellite, Trees } from "lucide-react"
import { CustomDroneIcon } from "@/components/drone-icon"

interface NarrativeSectionProps {
  selectedFeature: number
  imageFade: boolean
  onSelectFeature: (index: number) => void
}

const FEATURES = [
  {
    title: "PostgreSQL Connectors",
    desc: "Securely connect production Postgres instances with schema discovery and health checks.",
    icon: CustomDroneIcon,
    image: "/drone.png",
  },
  {
    title: "Real-time Monitoring",
    desc: "Track pipeline runs, SLAs, and incidents in real time with rich run history.",
    icon: Satellite,
    image: "/real-time-satellite.png",
  },
  {
    title: "Data Quality & Lineage",
    desc: "Trace column-level lineage and monitor freshness, volume, and quality signals.",
    icon: PawPrint,
    image: "/biodiversity-tracking.png",
  },
  {
    title: "AI-Assisted Operations",
    desc: "Use AI to summarize failures, suggest fixes, and generate pipeline documentation.",
    icon: Trees,
    image: "/deforestation-detect.png",
  },
] as const

export function NarrativeSection({ selectedFeature, imageFade, onSelectFeature }: NarrativeSectionProps) {
  return (
    <section id="narrative" className="relative py-20 md:py-32 px-4 animate-on-scroll">
      <div className="max-w-[1120px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
          <div className="max-w-[720px]">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-[#A7ABB3] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              DATA PLATFORM
            </div>
            <h2 className="font-serif text-[36px] leading-[1.15] md:text-[56px] md:leading-[1.1] font-medium mb-8 text-balance">
              One place to operate{" "}
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                all your pipelines
              </span>
            </h2>
            <p className="text-[#A7ABB3] text-base md:text-lg leading-relaxed mb-12">
              MantrixFlow brings data sources, pipelines, runs, and monitoring into a single workspace. Built for data
              engineers, analytics engineers, and platform teams who need reliability without complex DIY tooling.
            </p>

            <div className="md:hidden mb-8">
              <div className="rounded-[24px] p-1 w-full aspect-square overflow-hidden">
                <img
                  src={FEATURES[selectedFeature]?.image || "/placeholder.svg"}
                  alt="Feature preview"
                  className={`w-full h-full object-cover rounded-[20px] transition-opacity duration-300 ${
                    imageFade ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-6">
              {FEATURES.map((feature, i) => (
                <button
                  key={feature.title}
                  onClick={() => onSelectFeature(i)}
                  className={`relative w-full text-left flex gap-4 items-start p-5 transition-all duration-300 rounded-xs py-4 overflow-hidden ${
                    selectedFeature === i ? "border border-white/20" : "border border-white/10"
                  }`}
                >
                  <feature.icon
                    className={`w-6 h-6 flex-shrink-0 mt-1 transition-colors ${
                      selectedFeature === i ? "text-green-400" : "text-green-500/60"
                    }`}
                  />
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm md:text-base text-[#A7ABB3]">{feature.desc}</p>
                  </div>
                  {selectedFeature === i && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
                      <div className="h-full bg-white progress-bar" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-stretch justify-center">
            <div className="relative w-full h-full min-h-[500px]">
              {FEATURES.map((feature, i) => {
                const positionInStack = (i - selectedFeature + FEATURES.length) % FEATURES.length
                const isActive = positionInStack === 0

                return (
                  <div
                    key={feature.title}
                    className="absolute inset-0 p-1 transition-all duration-600 ease-out"
                    style={{
                      zIndex: FEATURES.length - positionInStack,
                      transform: `translateX(${positionInStack * 16}px) scale(${
                        1 - positionInStack * 0.02
                      })`,
                      opacity: isActive ? (imageFade ? 1 : 1) : 0.6 - positionInStack * 0.15,
                    }}
                  >
                    <img
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


