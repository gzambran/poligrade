import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-divider bg-background" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Explore */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/quiz" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Voter Alignment Quiz
                </Link>
              </li>
              <li>
                <Link href="/grades" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Politician Grades
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Connect</h3>
            <a
              href="https://www.youtube.com/@PoliGrade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border-2 border-[#FF4444] text-[#FF4444] hover:bg-[#FF0000] hover:text-white transition-colors rounded"
              aria-label="Visit PoliGrade on YouTube (opens in new window)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-divider">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm text-foreground/80">
            <p>&copy; {currentYear} PoliGrade. All rights reserved.</p>
            <span className="hidden sm:inline">•</span>
            <p>
              Site by{' '}
              <a
                href="https://giancarlos.nyc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors"
              >
                Giancarlos Zambrano
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
