import { useRef, useState, type FC } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Copy, Check, Download } from 'lucide-react'
import type { DecodedOtpAccount } from '../lib/google-authenticator'

interface QrModalProps {
  account: DecodedOtpAccount | null
  onClose: () => void
}

export const QrModal: FC<QrModalProps> = ({ account, onClose }) => {
  const [copiedUri, setCopiedUri] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  if (!account) return null

  const handleCopyUri = async () => {
    await navigator.clipboard.writeText(account.otpauthUri)
    setCopiedUri(true)
    setTimeout(() => setCopiedUri(false), 2000)
  }

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(account.secretBase32)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const handleDownloadPng = () => {
    if (!svgRef.current) return
    const svgElement = svgRef.current
    const svgString = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const URL = window.URL || window.webkitURL || window
    const blobURL = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 600
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 600, 600)
        ctx.drawImage(img, 0, 0, 600, 600)
        const pngUrl = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `${account.issuer || 'OTP'}_${account.name || 'account'}_qrcode.png`.replace(/[^\w.-]/g, '_')
        downloadLink.href = pngUrl
        downloadLink.click()
      }
    }
    img.src = blobURL
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#12131c] border border-[#272b3c] rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#757c91] hover:text-[#f4f4f5] p-1 rounded-md hover:bg-[#1f2231] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="text-base font-semibold text-[#f4f4f5] tracking-tight">
            {account.issuer || 'OTP 验证器'}
          </div>
          <div className="text-xs text-[#8a91a5] font-mono truncate mt-0.5">
            {account.name}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-xl flex items-center justify-center mx-auto shadow-inner w-[240px] h-[240px]">
          <QRCodeSVG
            ref={svgRef}
            value={account.otpauthUri}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>

        <p className="text-[12px] text-center text-[#7e859b] mt-3">
          使用 1Password / Bitwarden / Microsoft / 2FAS 扫描此二维码直接导入
        </p>

        {/* Secret & Info Details */}
        <div className="mt-5 space-y-2.5">
          <div className="p-2.5 rounded-lg bg-[#0b0c13] border border-[#1e202e] flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <div className="text-[10px] text-[#63697e] uppercase font-semibold tracking-wider">
                Base32 密钥明文 (Secret)
              </div>
              <div className="font-mono text-xs text-[#cfd4e6] truncate select-all">
                {account.secretBase32}
              </div>
            </div>
            <button
              onClick={handleCopySecret}
              className="p-1.5 rounded-md hover:bg-[#1a1c29] text-[#7d849b] hover:text-[#e2e5f2] transition-colors"
              title="复制密钥"
            >
              {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#0b0c13] border border-[#1e202e]">
              <span className="text-[#63697e]">算法 / 位数：</span>
              <span className="text-[#cbd1e5] font-medium ml-1">
                {account.algorithm} · {account.digits}位
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#0b0c13] border border-[#1e202e]">
              <span className="text-[#63697e]">类型 / 周期：</span>
              <span className="text-[#cbd1e5] font-medium ml-1">
                {account.type.toUpperCase()} · {account.period}s
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={handleDownloadPng}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#1a1c29] hover:bg-[#25283a] text-[#dce0ef] border border-[#2b3046] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>保存二维码 PNG</span>
          </button>

          <button
            onClick={handleCopyUri}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#5e6ad2] hover:bg-[#6e7ae3] text-white transition-colors"
          >
            {copiedUri ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUri ? '已复制 URI' : '复制 otpauth URI'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
