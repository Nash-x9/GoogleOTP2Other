import { useState, useEffect, type FC, type MouseEvent } from 'react'
import { Copy, Check, QrCode, Eye, EyeOff } from 'lucide-react'
import type { DecodedOtpAccount } from '../lib/google-authenticator'
import { generateTotpCode } from '../lib/totp'

interface AccountCardProps {
  account: DecodedOtpAccount
  remainingSeconds: number
  progressPercent: number
  onViewQr: (account: DecodedOtpAccount) => void
}

export const AccountCard: FC<AccountCardProps> = ({
  account,
  remainingSeconds,
  progressPercent,
  onViewQr,
}) => {
  const [totpCode, setTotpCode] = useState<string>('------')
  const [showSecret, setShowSecret] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUri, setCopiedUri] = useState(false)

  // Refresh code whenever remainingSeconds hits 30 or mounts
  useEffect(() => {
    let isMounted = true
    generateTotpCode(account.secretBase32, {
      algorithm: account.algorithm,
      digits: account.digits,
      period: account.period,
    }).then((code) => {
      if (isMounted) setTotpCode(code)
    })
    return () => {
      isMounted = false
    }
  }, [account, remainingSeconds])

  const handleCopyCode = async (e: MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(totpCode.replace(/\s+/g, ''))
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyUri = async (e: MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(account.otpauthUri)
    setCopiedUri(true)
    setTimeout(() => setCopiedUri(false), 2000)
  }

  // Format code display with a space in the middle e.g. 123 456
  const formattedCode =
    totpCode.length === 6
      ? `${totpCode.slice(0, 3)} ${totpCode.slice(3)}`
      : totpCode.length === 8
      ? `${totpCode.slice(0, 4)} ${totpCode.slice(4)}`
      : totpCode

  // Generate an avatar letter and subtle deterministic hue
  const initial = (account.issuer || account.name || 'O').charAt(0).toUpperCase()

  return (
    <div className="group bg-[#11121a] hover:bg-[#141522] border border-[#232535] hover:border-[#383d56] rounded-xl p-4 transition-all duration-200 flex flex-col justify-between">
      {/* Top row: Avatar, Issuer & Name */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1a1c2b] border border-[#2b3049] flex items-center justify-center font-semibold text-xs text-[#9aa4d6] shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#f0f2f8] truncate">
                {account.issuer || '未知服务'}
              </div>
              <div className="text-[11px] text-[#71778c] font-mono truncate" title={account.name}>
                {account.name}
              </div>
            </div>
          </div>

          {/* Quick QR button / badge */}
          <button
            onClick={() => onViewQr(account)}
            className="p-1.5 rounded-lg bg-[#181926] hover:bg-[#24273b] border border-[#292d42] text-[#8e96b3] hover:text-[#f0f2f8] transition-colors shrink-0"
            title="查看并扫码导入"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Middle row: Live TOTP code */}
        <div className="mt-4 p-3 rounded-lg bg-[#0b0c13] border border-[#1d1f2e] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              onClick={handleCopyCode}
              className="font-mono text-xl font-bold tracking-wider text-[#e6e9f5] cursor-pointer hover:text-white transition-colors"
              title="点击复制动态口令"
            >
              {formattedCode}
            </span>
            <span className="text-[10px] text-[#555a6e] font-mono">
              {account.digits}位 {account.algorithm}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Countdown pie / seconds */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#787f98]">
              <span className={remainingSeconds <= 5 ? 'text-amber-400 font-bold' : ''}>
                {remainingSeconds}s
              </span>
              <div className="w-3.5 h-3.5 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#232636"
                    strokeWidth="3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke={remainingSeconds <= 5 ? '#f59e0b' : '#5e6ad2'}
                    strokeWidth="3"
                    strokeDasharray={62.83}
                    strokeDashoffset={62.83 * (progressPercent / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-linear"
                  />
                </svg>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="p-1 rounded text-[#71778c] hover:text-[#e4e7f2] hover:bg-[#1a1c29] transition-colors"
              title="复制验证码"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secret toggle & Actions */}
      <div className="mt-3 pt-3 border-t border-[#1d1f2d] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-[#5f657a] min-w-0 mr-2">
            <span>密钥:</span>
            {showSecret ? (
              <span className="font-mono text-[#cbd1e5] truncate select-all">{account.secretBase32}</span>
            ) : (
              <span className="font-mono text-[#44485b]">••••••••••••••••</span>
            )}
          </div>

          <button
            onClick={() => setShowSecret(!showSecret)}
            className="text-[#6c7288] hover:text-[#c7ccd9] transition-colors shrink-0"
            title={showSecret ? '隐藏密钥' : '显示密钥明文'}
          >
            {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            onClick={handleCopyUri}
            className="text-[11px] text-[#787f98] hover:text-[#d3d8ed] flex items-center gap-1 hover:underline transition-colors"
          >
            {copiedUri ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUri ? '已复制 URI' : '复制 otpauth URI'}</span>
          </button>

          <button
            onClick={() => onViewQr(account)}
            className="text-[11px] text-[#5e6ad2] hover:text-[#7883e5] font-medium flex items-center gap-1 transition-colors"
          >
            <span>显示二维码</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  )
}
