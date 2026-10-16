import { useState, type FC } from 'react'
import { X, Copy, Check, FileText, Download } from 'lucide-react'
import type { DecodedOtpAccount } from '../lib/google-authenticator'
import { useI18n } from '../lib/i18n.tsx'

interface ExportModalProps {
  accounts: DecodedOtpAccount[]
  onClose: () => void
}

export const ExportModal: FC<ExportModalProps> = ({ accounts, onClose }) => {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const allUris = accounts.map((a) => a.otpauthUri).join('\n')

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(allUris)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([allUris], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `otpauth_uris_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(
      accounts.map((a) => ({
        issuer: a.issuer,
        name: a.name,
        secret: a.secretBase32,
        algorithm: a.algorithm,
        digits: a.digits,
        type: a.type,
        period: a.period,
        uri: a.otpauthUri,
      })),
      null,
      2
    )
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `otp_accounts_export_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadCsv = () => {
    const headers = ['Issuer', 'Name', 'Secret(Base32)', 'Algorithm', 'Digits', 'Type', 'URI']
    const rows = accounts.map((a) => [
      `"${(a.issuer || '').replace(/"/g, '""')}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${a.secretBase32}"`,
      a.algorithm,
      a.digits,
      a.type,
      `"${a.otpauthUri.replace(/"/g, '""')}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `otp_accounts_export_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#12131c] border border-[#272b3c] rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#757c91] hover:text-[#f4f4f5] p-1 rounded-md hover:bg-[#1f2231] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="text-base font-semibold text-[#f4f4f5]">{t.exportModalTitle}</div>
          <div className="text-xs text-[#8a91a5] mt-0.5">
            {t.exportModalDesc(accounts.length)}
          </div>
        </div>

        {/* Text preview */}
        <div className="relative mb-4">
          <textarea
            readOnly
            value={allUris}
            rows={5}
            className="w-full bg-[#0b0c13] border border-[#212330] rounded-lg p-3 text-xs font-mono text-[#aeb6cf] outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleDownloadJson}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#191a27] hover:bg-[#222436] text-[#cbd1e5] border border-[#2a2d40] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#7e8ce0]" />
            <span>{t.downloadJson}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#191a27] hover:bg-[#222436] text-[#cbd1e5] border border-[#2a2d40] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#34d399]" />
            <span>{t.downloadCsv}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadTxt}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#191a27] hover:bg-[#222436] text-[#cbd1e5] border border-[#2a2d40] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.downloadTxt}</span>
          </button>

          <button
            onClick={handleCopyAll}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#5e6ad2] hover:bg-[#6e7ae3] text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copiedAll : t.copyAll}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
