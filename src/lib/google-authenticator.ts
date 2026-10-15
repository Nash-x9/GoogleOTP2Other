import protobuf from 'protobufjs'
import { uint8ArrayToBase32 } from './base32'

export interface DecodedOtpAccount {
  id: string
  name: string
  issuer: string
  secretBase32: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' | 'MD5'
  digits: 6 | 8
  type: 'totp' | 'hotp'
  counter?: number
  period: number
  otpauthUri: string
}

export interface MigrationBatchInfo {
  version?: number
  batchSize?: number
  batchIndex?: number
  batchId?: number
  accounts: DecodedOtpAccount[]
}

const protoDefinition = `
syntax = "proto3";

enum Algorithm {
  ALGORITHM_UNSPECIFIED = 0;
  ALGORITHM_SHA1 = 1;
  ALGORITHM_SHA256 = 2;
  ALGORITHM_SHA512 = 3;
  ALGORITHM_MD5 = 4;
}

enum DigitCount {
  DIGIT_COUNT_UNSPECIFIED = 0;
  DIGIT_COUNT_SIX = 1;
  DIGIT_COUNT_EIGHT = 2;
}

enum OtpType {
  OTP_TYPE_UNSPECIFIED = 0;
  OTP_TYPE_HOTP = 1;
  OTP_TYPE_TOTP = 2;
}

message MigrationPayload {
  message OtpParameters {
    bytes secret = 1;
    string name = 2;
    string issuer = 3;
    Algorithm algorithm = 4;
    DigitCount digits = 5;
    OtpType type = 6;
    int64 counter = 7;
  }

  repeated OtpParameters otp_parameters = 1;
  int32 version = 2;
  int32 batch_size = 3;
  int32 batch_index = 4;
  int32 batch_id = 5;
}
`

let MigrationPayloadType: protobuf.Type | null = null

function getMessageType(): protobuf.Type {
  if (!MigrationPayloadType) {
    const root = protobuf.parse(protoDefinition).root
    MigrationPayloadType = root.lookupType('MigrationPayload')
  }
  return MigrationPayloadType
}

/**
 * Base64 helper supporting browser environment
 */
function base64ToUint8Array(base64: string): Uint8Array {
  // Normalize URL-safe base64
  let normalized = base64.replace(/-/g, '+').replace(/_/g, '/')
  while (normalized.length % 4) {
    normalized += '='
  }
  const binaryString = atob(normalized)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

function mapAlgorithm(algoNumber?: number): 'SHA1' | 'SHA256' | 'SHA512' | 'MD5' {
  switch (algoNumber) {
    case 2:
      return 'SHA256'
    case 3:
      return 'SHA512'
    case 4:
      return 'MD5'
    case 1:
    default:
      return 'SHA1'
  }
}

function mapDigits(digitNumber?: number): 6 | 8 {
  switch (digitNumber) {
    case 2:
      return 8
    case 1:
    default:
      return 6
  }
}

function mapType(typeNumber?: number): 'totp' | 'hotp' {
  switch (typeNumber) {
    case 1:
      return 'hotp'
    case 2:
    default:
      return 'totp'
  }
}

/**
 * Build a standard otpauth:// URI for other authenticators
 */
export function buildOtpauthUri(account: {
  type: 'totp' | 'hotp'
  issuer: string
  name: string
  secretBase32: string
  algorithm: string
  digits: number
  counter?: number
  period?: number
}): string {
  const issuerPart = account.issuer ? `${encodeURIComponent(account.issuer)}:` : ''
  const namePart = encodeURIComponent(account.name)
  const label = `${issuerPart}${namePart}`

  const params = new URLSearchParams()
  params.set('secret', account.secretBase32)

  if (account.issuer) {
    params.set('issuer', account.issuer)
  }
  if (account.algorithm && account.algorithm !== 'SHA1') {
    params.set('algorithm', account.algorithm)
  }
  if (account.digits && account.digits !== 6) {
    params.set('digits', String(account.digits))
  }
  if (account.type === 'totp') {
    const period = account.period || 30
    if (period !== 30) {
      params.set('period', String(period))
    }
  } else if (account.type === 'hotp') {
    params.set('counter', String(account.counter ?? 0))
  }

  return `otpauth://${account.type}/${label}?${params.toString()}`
}

/**
 * Parse otpauth-migration:// URI or raw data query
 */
export function parseMigrationUri(input: string): MigrationBatchInfo {
  let rawData = input.trim()

  // If input is an otpauth-migration link
  if (rawData.startsWith('otpauth-migration://')) {
    const match = rawData.match(/[?&]data=([^&]+)/)
    if (match) {
      try {
        rawData = decodeURIComponent(match[1])
      } catch {
        rawData = match[1]
      }
    } else {
      throw new Error('URI 缺少 data 参数')
    }
  }

  // Restore '+' that might be converted to spaces in query strings
  rawData = rawData.replace(/ /g, '+').trim()

  const bytes = base64ToUint8Array(rawData)
  const Type = getMessageType()
  const decoded = Type.decode(bytes) as any

  const rawParams = decoded.otpParameters || decoded.otp_parameters || []

  const accounts: DecodedOtpAccount[] = rawParams.map((param: any, idx: number) => {
    const secretBytes = param.secret ? new Uint8Array(param.secret) : new Uint8Array()
    const secretBase32 = uint8ArrayToBase32(secretBytes)

    let name = param.name || ''
    let issuer = param.issuer || ''

    // If issuer is empty, Google often embeds it as "Issuer:Account"
    if (!issuer && name.includes(':')) {
      const split = name.split(':')
      issuer = split[0].trim()
      name = split.slice(1).join(':').trim()
    }

    const algorithm = mapAlgorithm(param.algorithm)
    const digits = mapDigits(param.digits)
    const type = mapType(param.type)
    const counter = param.counter ? Number(param.counter) : 0
    const period = 30

    const otpauthUri = buildOtpauthUri({
      type,
      issuer,
      name,
      secretBase32,
      algorithm,
      digits,
      counter,
      period,
    })

    return {
      id: `acc_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
      name: name || '未命名账户',
      issuer: issuer || '未知服务',
      secretBase32,
      algorithm,
      digits,
      type,
      counter,
      period,
      otpauthUri,
    }
  })

  return {
    version: decoded.version,
    batchSize: decoded.batchSize ?? decoded.batch_size,
    batchIndex: decoded.batchIndex ?? decoded.batch_index,
    batchId: decoded.batchId ?? decoded.batch_id,
    accounts,
  }
}
