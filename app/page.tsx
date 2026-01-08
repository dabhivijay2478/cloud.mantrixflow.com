"use client"

import { useEffect, useRef, useState } from "react"
import { HeroSection } from "@/components/landing/hero"
import { LandingHeader } from "@/components/landing/header"
import { MetricsSection } from "@/components/landing/metrics"
import { PartnersSection } from "@/components/landing/partners"
import { NarrativeSection } from "@/components/landing/narrative"
import { MapSection } from "@/components/landing/map-section"
import { CtaSection } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState(0)
  const [imageFade, setImageFade] = useState(true)
  const [autoRotationKey, setAutoRotationKey] = useState(0)
  const [dynamicWordIndex, setDynamicWordIndex] = useState(0)
  const [wordFade, setWordFade] = useState(true)
  const [dashboardScrollOffset, setDashboardScrollOffset] = useState(0)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  const dynamicWords = ["pipelines", "workloads", "jobs", "syncs", "models", "transformations", "datasets"]

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordFade(false)
      setTimeout(() => {
        setDynamicWordIndex((prev) => (prev + 1) % dynamicWords.length)
        setWordFade(true)
      }, 300)
    }, 3000)

    return () => clearInterval(wordInterval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      if (dashboardRef.current) {
        const dashboardRect = dashboardRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        const rotationStart = viewportHeight * 0.8
        const rotationEnd = viewportHeight * 0.2

        if (dashboardRect.top >= rotationStart) {
          setDashboardScrollOffset(0)
        } else if (dashboardRect.top <= rotationEnd) {
          setDashboardScrollOffset(15)
        } else {
          const scrollRange = rotationStart - rotationEnd
          const currentProgress = rotationStart - dashboardRect.top
          const rotationProgress = currentProgress / scrollRange
          const tiltAngle = rotationProgress * 15
          setDashboardScrollOffset(tiltAngle)
        }
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsLoaded(true)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    const elements = document.querySelectorAll(".animate-on-scroll")
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [])

  useEffect(() => {
    const featuresCount = 4

    const interval = setInterval(() => {
      setImageFade(false)
      setTimeout(() => {
        setSelectedFeature((prev) => (prev + 1) % featuresCount)
        setImageFade(true)
      }, 300)
    }, 6000)

    return () => clearInterval(interval)
  }, [autoRotationKey])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSelectFeature = (index: number) => {
    setImageFade(false)
    setTimeout(() => {
      setSelectedFeature(index)
      setImageFade(true)
      setAutoRotationKey((prev) => prev + 1)
    }, 300)
  }

  return (
    <div className="relative min-h-screen bg-[#0B0C0F] text-[#F2F3F5] overflow-x-hidden">
      <LandingHeader onScrollToSection={scrollToSection} />

      <HeroSection
        heroRef={heroRef}
        dashboardRef={dashboardRef}
        scrollY={scrollY}
        isLoaded={isLoaded}
        dashboardScrollOffset={dashboardScrollOffset}
        dynamicWord={dynamicWords[dynamicWordIndex]}
        wordFade={wordFade}
      />

      <PartnersSection />
      <MetricsSection />
      <MapSection />

      <NarrativeSection
        selectedFeature={selectedFeature}
        imageFade={imageFade}
        onSelectFeature={handleSelectFeature}
      />

      <CtaSection />
      <LandingFooter />
    </div>
  )
}
