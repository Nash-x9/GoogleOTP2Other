import type { FC } from 'react'
import { ShieldCheck, RefreshCw, KeyRound, Languages } from 'lucide-react'
import { useI18n } from '../lib/i18n.tsx'

interface HeaderProps {
  onReset: () => void
  hasData: boolean
}

export const Header: FC<HeaderProps> = ({ onReset, hasData }) => {
  const { lang, toggleLang, t } = useI18n()

  return (
    <header className="border-b border-[#232530] bg-[#0c0d14]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1f2233] border border-[#2d3148] flex items-center justify-center text-[#7e8ce0]">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-[#f4f4f5] tracking-tight">GoogleOTP2Other</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#1c1f2e] text-[#8e98b0] border border-[#282d42]">
                {t.subtitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#717684] px-2.5 py-1 rounded-md bg-[#12141c] border border-[#20222e]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{t.offlineBadge}</span>
          </div>

          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#1a1b26] hover:bg-[#252838] text-[#c0c5d6] border border-[#2b2e40] transition-colors"
              title={t.resetBtn}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.resetBtn}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#12141c] hover:bg-[#1c1f2e] text-[#8e98b0] hover:text-[#f4f4f5] border border-[#20222e] hover:border-[#2d3148] transition-colors"
            title={lang === 'zh' ? 'Switch to English' : '切换为简体中文'}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-medium">{lang === 'zh' ? 'EN' : '中'}</span>
          </button>

          <a
            href="https://github.com/Nash-x9/GoogleOPT2Other"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#12141c] hover:bg-[#1c1f2e] text-[#8e98b0] hover:text-[#f4f4f5] border border-[#20222e] hover:border-[#2d3148] transition-colors"
            title="GitHub"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
