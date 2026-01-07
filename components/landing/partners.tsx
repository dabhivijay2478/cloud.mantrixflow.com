export function PartnersSection() {
  const logos = [
    "/logos/frame-11.png",
    "/logos/frame-55.png",
    "/logos/frame-4.png",
    "/logos/frame-6.png",
    "/logos/frame-8.png",
    "/logos/frame-2.png",
    "/logos/frame-3.png",
    "/logos/frame-7.png",
  ]

  return (
    <section className="relative py-12 border-y border-white/5 bg-[#0B0C0F] overflow-hidden md:py-8 md:pt-8 md:pb-4">
      <div className="w-full">
        <p className="text-center text-xs md:text-sm uppercase tracking-[0.2em] text-[#A7ABB3] mb-8">
          Trusted by data teams and engineering organizations
        </p>
        <div className="logo-marquee">
          <div className="logo-marquee-content">
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo}-${i}`} className="px-8 md:px-12 flex items-center justify-center flex-shrink-0">
                <img
                  src={logo || "/placeholder.svg"}
                  alt={`Partner logo ${i + 1}`}
                  className="h-32 md:h-24 w-auto object-contain opacity-60 hover:opacity-60 transition-all duration-300 brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


