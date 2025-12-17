import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link
      href="/"
      className="hover:opacity-80 transition-opacity cursor-pointer block h-16 overflow-visible"
      aria-label="PoliGrade Home"
    >
      <Image
        src="/logo.svg"
        alt="PoliGrade"
        width={192}
        height={192}
        className="w-48 h-48 pointer-events-none"
        priority
      />
    </Link>
  )
}
