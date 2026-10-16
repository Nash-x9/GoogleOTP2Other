import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Download,
  PlusCircle,
} from 'lucide-react'
import { Header } from './components/Header'
import { ScannerZone } from './components/ScannerZone'
import { AccountCard } from './components/AccountCard'
import { QrModal } from './components/QrModal'
import { ExportModal } from './components/ExportModal'
import {
  parseMigrationUri,
  type DecodedOtpAccount,
  type MigrationBatchInfo,
} from './lib/google-authenticator'
import { getRemainingPeriodSeconds } from './lib/totp'
import { useI18n } from './lib/i18n.tsx'

export function App() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<DecodedOtpAccount[]>([])
  const [batchInfo, setBatchInfo] = useState<MigrationBatchInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQrAccount, setSelectedQrAccount] = useState<DecodedOtpAccount | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [showAppendScanner, setShowAppendScanner] = useState(false)

  // Global 30s cycle timer
  const [timeInfo, setTimeInfo] = useState(getRemainingPeriodSeconds(30))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getRemainingPeriodSeconds(30))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle scanned migration URI
  const handleScanSuccess = (rawUri: string) => {
    try {
      const result = parseMigrationUri(rawUri)
      if (!result.accounts.length) {
        alert(t.parseNoAccounts)
        return
      }

      setAccounts((prev) => {
        // Prevent duplicate accounts by matching name & issuer & secret
        const existingKeys = new Set(
          prev.map((a) => `${a.issuer}:${a.name}:${a.secretBase32}`)
        )
        const newOnes = result.accounts.filter(
          (a) => !existingKeys.has(`${a.issuer}:${a.name}:${a.secretBase32}`)
        )
        return [...prev, ...newOnes]
      })

      setBatchInfo(result)
      setShowAppendScanner(false)
    } catch (err: any) {
      alert(`${t.parseFailed}: ${err.message || 'error'}`)
    }
  }

  const handleReset = () => {
    if (confirm(t.resetConfirm)) {
      setAccounts([])
      setBatchInfo(null)
      setShowAppendScanner(false)
    }
  }

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return accounts
    return accounts.filter(
      (a) =>
        a.issuer.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.secretBase32.toLowerCase().includes(q)
    )
  }, [accounts, searchQuery])

  return (
    <div className="min-w-[320px] min-h-screen bg-[#090a0f] text-[#f4f4f5] flex flex-col font-sans selection:bg-[#5e6ad2]/30 selection:text-white">
      <Header onReset={handleReset} hasData={accounts.length > 0} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Intro prototype guidance banner (concise & practical) */}
        {accounts.length === 0 && (
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[#f4f4f5] mb-2">
              {t.heroTitle}
            </h1>
            <p className="text-xs text-[#8a91a5] leading-relaxed max-w-lg mx-auto">
              {t.heroDesc}
            </p>
          </div>
        )}

        {/* Scanner Area */}
        {(accounts.length === 0 || showAppendScanner) && (
          <div className="max-w-xl mx-auto mb-8">
            <div className="bg-[#111219] border border-[#232533] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#cfd4e6] tracking-wide uppercase">
                  {showAppendScanner ? t.scannerAppend : t.scannerStep1}
                </span>
                {showAppendScanner && (
                  <button
                    onClick={() => setShowAppendScanner(false)}
                    className="text-xs text-[#81879c] hover:text-[#e4e7f2]"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>
              <ScannerZone onScanSuccess={handleScanSuccess} />
            </div>
          </div>
        )}

        {/* Results Area */}
        {accounts.length > 0 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#111219] border border-[#232533]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#f0f2f8]">
                  {t.decryptedCount(accounts.length)}
                </span>
                {batchInfo?.batchSize && batchInfo.batchSize > 1 && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#1d1f2e] text-[#8e98b0] border border-[#2c3148]">
                    {t.batchBadge((batchInfo.batchIndex ?? 0) + 1, batchInfo.batchSize)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-[#5e6479] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-[#0b0c13] border border-[#222434] focus:border-[#5e6ad2] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#e1e4ee] placeholder-[#53586b] outline-none transition-colors"
                  />
                </div>

                {/* Append Batch */}
                <button
                  onClick={() => setShowAppendScanner(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a1c29] hover:bg-[#232638] text-[#c9cfdf] border border-[#2b2f44] rounded-lg transition-colors whitespace-nowrap"
                  title={t.appendTip}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t.appendBtn}</span>
                </button>

                {/* Batch Export */}
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#5e6ad2] hover:bg-[#6c79e6] text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportBtn}</span>
                </button>
              </div>
            </div>

            {/* Account Cards Grid */}
            {filteredAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    remainingSeconds={timeInfo.remaining}
                    progressPercent={timeInfo.progressPercent}
                    onViewQr={setSelectedQrAccount}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-[#6e7488]">
                {t.noMatch}
              </div>
            )}
          </div>
        )}
      </main>

      {/* QR Details Modal */}
      {selectedQrAccount && (
        <QrModal
          account={selectedQrAccount}
          onClose={() => setSelectedQrAccount(null)}
        />
      )}

      {/* Export Modal */}
      {isExportOpen && (
        <ExportModal
          accounts={accounts}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-[#1a1c26] py-4 text-center text-[11px] text-[#555a6d] flex items-center justify-center gap-3">
        <span>{t.footerPrivacy}</span>
        <span>·</span>
        <a
          href="https://github.com/Nash-x9/GoogleOPT2Other"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#717684] hover:text-[#d3d8ed] transition-colors"
        >
          {t.githubRepo}
        </a>
      </footer>
    </div>
  )
}

export default App
