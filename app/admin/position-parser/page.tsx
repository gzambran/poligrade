import PositionParserClient from './PositionParserClient'

export const metadata = {
  title: 'Position Parser - PoliGrade Admin',
  description: 'Extract politician policy positions from website URLs',
}

export default function PositionParserPage() {
  return <PositionParserClient />
}
