import { RefObject } from "react"
import { Button } from "@/components/ui/button"
import { AnimatedText } from "@/components/animated-text"

interface HeroSectionProps {
  heroRef: RefObject<HTMLDivElement | null>
  dashboardRef: RefObject<HTMLDivElement | null>
  scrollY: number
  isLoaded: boolean
  dashboardScrollOffset: number
  dynamicWord: string
  wordFade: boolean
}

export function HeroSection({
  heroRef,
  dashboardRef,
  scrollY,
  isLoaded,
  dashboardScrollOffset,
  dynamicWord,
  wordFade,
}: HeroSectionProps) {
  return (
    <section
      ref={heroRef}
      className={`relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 md:pt-32 md:pb-24 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        isLoaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
      }`}
      style={{
        backgroundImage: `url('/hero-landscape.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          backgroundImage: `url('/hero-landscape.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0F] via-[#0B0C0F]/70 to-transparent pointer-events-none" />

      <div
        className="max-w-[1120px] w-full mx-auto relative z-10"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      >
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-serif text-[44px] leading-[1.1] md:text-[72px] md:leading-[1.05] font-medium mb-6 text-balance">
            <span
              className={`block stagger-reveal text-7xl font-light transition-all duration-500 md:text-8xl ${
                wordFade ? "opacity-100 blur-0" : "opacity-0 blur-lg"
              }`}
            >
              Ship reliable{" "}
              <AnimatedText key={dynamicWord} text={dynamicWord} delay={0} />
            </span>
            <span className="block stagger-reveal text-7xl font-light md:text-8xl" style={{ animationDelay: "90ms" }}>
              data pipelines, at scale
            </span>
          </h1>
          <p
            className="text-[#A7ABB3] text-base md:text-lg max-w-[620px] mx-auto mb-8 leading-relaxed stagger-reveal text-white"
            style={{ animationDelay: "180ms" }}
          >
            MantrixFlow is your control plane for data pipelines. Connect databases, warehouses, and APIs, orchestrate transformations,
            monitor runs, and ship trusted data products with AI-assisted insights.
          </p>
          <div className="stagger-reveal" style={{ animationDelay: "270ms" }}>
            <Button className="glass-button px-8 py-6 text-base rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white">
              Start building pipelines
            </Button>
          </div>
        </div>

        <div className="mt-12 md:mt-20 stagger-reveal" style={{ animationDelay: "360ms" }} ref={dashboardRef}>
          <div style={{ perspective: "1200px" }}>
            <div
              className="relative aspect-[16/10] md:aspect-[16/9] rounded-[24px] overflow-hidden"
              style={{
                transform: `rotateX(${dashboardScrollOffset}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.05s linear",
              }}
            >
              <img
                src="/dashboard-screenshot.png"
                alt="MantrixFlow pipeline orchestration and monitoring platform"
                className="object-cover dashboard-image w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


