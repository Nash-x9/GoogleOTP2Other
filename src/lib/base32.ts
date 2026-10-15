// RFC 4648 Base32 implementation

const RFC4648_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function uint8ArrayToBase32(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8

    while (bits >= 5) {
      output += RFC4648_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += RFC4648_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

export function base32ToUint8Array(base32: string): Uint8Array {
  const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const result: number[] = []

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const val = RFC4648_ALPHABET.indexOf(char)
    if (val === -1) {
      throw new Error(`Invalid Base32 character: ${char}`)
    }
    value = (value << 5) | val
    bits += 5

    if (bits >= 8) {
      result.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(result)
}
