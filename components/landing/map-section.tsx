import { WorldMap } from "@/components/world-map"
import { experiences } from "@/lib/experience-data"
import type { Experience } from "@/lib/experience-data"

interface MapSectionProps {
  selectedExperience: Experience | null
  onSelectExperience: (exp: Experience | null) => void
}

export function MapSection({ selectedExperience, onSelectExperience }: MapSectionProps) {
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
          Visualize where your data is coming from and how it flows through your stack – from source Postgres databases
          to downstream analytics.
        </p>
      </div>

      <WorldMap experiences={experiences} selectedExperience={selectedExperience} onSelectExperience={onSelectExperience} />
    </section>
  )
}


