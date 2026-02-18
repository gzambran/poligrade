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
