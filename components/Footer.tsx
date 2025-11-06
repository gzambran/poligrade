import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-divider bg-background" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop: Links */}
        <div className="hidden md:flex justify-center gap-6 mb-4">
          <Link href="/grades" className="text-sm text-foreground/60 hover:text-primary transition-colors">
            Politicians
          </Link>
          <Link href="/quiz" className="text-sm text-foreground/60 hover:text-primary transition-colors">
            Alignment Quiz
          </Link>
          <Link href="/contact" className="text-sm text-foreground/60 hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/donate" className="text-sm text-foreground/60 hover:text-primary transition-colors">
            Donate
          </Link>
          <Link href="/privacy" className="text-sm text-foreground/60 hover:text-primary transition-colors">
            Privacy
          </Link>
          <a
            href="https://www.youtube.com/@PoliGrade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground/60 hover:text-primary transition-colors"
          >
            YouTube
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-foreground/60">
          &copy; {currentYear} PoliGrade. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
