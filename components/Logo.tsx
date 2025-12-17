import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link
      href="/"
      className="hover:opacity-80 transition-opacity cursor-pointer"
      aria-label="PoliGrade Home"
    >
      <Image
        src="/logo.svg"
        alt="PoliGrade"
        width={120}
        height={40}
        className="h-10 w-auto"
        priority
      />
    </Link>
  )
}
