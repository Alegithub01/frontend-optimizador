// lib/flags.ts
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - "A".charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
