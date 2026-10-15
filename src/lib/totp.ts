import { base32ToUint8Array } from './base32'

/**
 * Generate standard TOTP code using Browser Web Crypto API (100% offline, zero server dependency)
 */
export async function generateTotpCode(
  secretBase32: string,
  options: {
    algorithm?: 'SHA1' | 'SHA256' | 'SHA512' | 'MD5'
    digits?: 6 | 8
    period?: number
    timestamp?: number
  } = {}
): Promise<string> {
  const {
    algorithm = 'SHA1',
    digits = 6,
    period = 30,
    timestamp = Date.now(),
  } = options

  if (!secretBase32) return '------'

  try {
    const keyBytes = base32ToUint8Array(secretBase32)
    const epochSeconds = Math.floor(timestamp / 1000)
    const counter = Math.floor(epochSeconds / period)

    // 8-byte big-endian counter
    const counterBuffer = new ArrayBuffer(8)
    const counterView = new DataView(counterBuffer)
    counterView.setUint32(0, Math.floor(counter / 0x100000000))
    counterView.setUint32(4, counter >>> 0)

    let hashName = 'SHA-1'
    if (algorithm === 'SHA256') hashName = 'SHA-256'
    if (algorithm === 'SHA512') hashName = 'SHA-512'

    // MD5 is deprecated and not supported in SubtleCrypto HMAC, fallback gracefully
    if (algorithm === 'MD5') {
      return 'UNSUPPORTED'
    }

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.buffer as ArrayBuffer,
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['sign']
    )

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer)
    const hmacBytes = new Uint8Array(signature)

    // Dynamic truncation RFC 4226
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f
    const binary =
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff)

    const otpNumber = binary % Math.pow(10, digits)
    return String(otpNumber).padStart(digits, '0')
  } catch (err) {
    console.error('TOTP generation failed:', err)
    return 'ERR'
  }
}

/**
 * Returns remaining seconds in the current 30s cycle
 */
export function getRemainingPeriodSeconds(period = 30): {
  remaining: number
  progressPercent: number
} {
  const epoch = Math.floor(Date.now() / 1000)
  const passed = epoch % period
  const remaining = period - passed
  const progressPercent = ((period - remaining) / period) * 100
  return { remaining, progressPercent }
}
