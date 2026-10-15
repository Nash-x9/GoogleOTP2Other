import type { FC } from 'react'
import { ShieldCheck, RefreshCw, KeyRound } from 'lucide-react'

interface HeaderProps {
  onReset: () => void
  hasData: boolean
}

export const Header: FC<HeaderProps> = ({ onReset, hasData }) => {
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
                Google OTP 迁移解密
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#717684] px-2.5 py-1 rounded-md bg-[#12141c] border border-[#20222e]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>本地离线解析 · 零数据上传</span>
          </div>

          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#1a1b26] hover:bg-[#252838] text-[#c0c5d6] border border-[#2b2e40] transition-colors"
              title="清除所有已解析数据"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>清空重新解析</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
