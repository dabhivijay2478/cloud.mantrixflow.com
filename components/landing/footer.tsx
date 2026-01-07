import { Youtube, Instagram } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="relative px-4 border-t border-white/5 py-8">
      <div className="max-w-[1120px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold font-mono">MantrixFlow</div>
            <p className="text-xs text-[#A7ABB3] leading-relaxed">
              Operate data pipelines, data sources, and BI surfaces from a single, AI‑assisted control plane.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase tracking-[0.15em] text-[#F2F3F5] font-semibold mb-2">Product</div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                Data sources
              </a>
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                Pipelines
              </a>
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                Monitoring
              </a>
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                BI surfaces
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase tracking-[0.15em] text-[#F2F3F5] font-semibold mb-2">Company</div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                About
              </a>
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                Blog
              </a>
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                Careers
              </a>
              <a href="#" className="text-sm text-[#A7ABB3] hover:text-[#F2F3F5] transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase tracking-[0.15em] text-[#F2F3F5] font-semibold mb-2">Newsletter</div>
            <p className="text-xs text-[#A7ABB3] mb-3">Get updates on data pipeline best practices and MantrixFlow news.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-[#F2F3F5] placeholder-[#A7ABB3] focus:outline-none focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/20 transition-all"
              />
              <button className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-pink-500/30 hover:border-pink-500/50 transition-all bg-green-800 border-green-700 text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#A7ABB3]">
          <div>© 2025 MantrixFlow. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#F2F3F5] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#F2F3F5] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#F2F3F5] transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


