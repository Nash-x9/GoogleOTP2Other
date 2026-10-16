import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Language = 'zh' | 'en'

export interface Translations {
  // Header
  subtitle: string
  offlineBadge: string
  resetBtn: string
  resetConfirm: string
  githubRepo: string

  // Hero / Intro
  heroTitle: string
  heroDesc: string

  // Scanner
  scannerStep1: string
  scannerAppend: string
  cancel: string
  tabUpload: string
  tabCamera: string
  tabText: string
  uploadTitle: string
  uploadProcessing: string
  uploadHint: string
  cameraHint: string
  cameraStarting: string
  cameraClose: string
  cameraError: string
  textPlaceholder: string
  textParseBtn: string
  parseNoAccounts: string
  parseFailed: string
  qrScanFailed: string

  // Results Toolbar
  decryptedCount: (count: number) => string
  batchBadge: (current: number, total: number) => string
  searchPlaceholder: string
  appendBtn: string
  appendTip: string
  exportBtn: string
  noMatch: string

  // Card
  unknownService: string
  unnamedAccount: string
  viewQrTitle: string
  copyCodeTitle: string
  codeCopied: string
  copyUri: string
  copiedUri: string
  showQr: string
  secretLabel: string
  showSecret: string
  hideSecret: string

  // QR Modal
  qrModalTip: string
  secretPlaintext: string
  algoDigits: string
  typePeriod: string
  digitsSuffix: string
  saveQrPng: string
  copyUriBtn: string
  copiedUriBtn: string

  // Export Modal
  exportModalTitle: string
  exportModalDesc: (count: number) => string
  downloadJson: string
  downloadCsv: string
  downloadTxt: string
  copyAll: string
  copiedAll: string

  // Footer
  footerPrivacy: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    subtitle: 'Google OTP 迁移解密',
    offlineBadge: '本地离线解析 · 零数据上传',
    resetBtn: '清空重新解析',
    resetConfirm: '确定要清空所有已解析的 OTP 数据吗？',
    githubRepo: 'GitHub 仓库',

    heroTitle: 'Google Authenticator 迁移解密',
    heroDesc: '扫描或上传从 Google 身份验证器导出的迁移二维码，自动反序列化解密并生成标准绑定二维码，供 1Password、Bitwarden、Microsoft Authenticator 等任意工具直接导入。',

    scannerStep1: '第一步：载入 Google 迁移二维码',
    scannerAppend: '扫描追加批次二维码',
    cancel: '取消',
    tabUpload: '上传 / 粘贴图片',
    tabCamera: '摄像头扫码',
    tabText: '文本链接',
    uploadTitle: '点击或拖拽上传 Google 导出的二维码',
    uploadProcessing: '正在解密二维码...',
    uploadHint: '支持 PNG, JPG, WebP 格式 · 支持直接按 ⌘V / Ctrl+V 粘贴截图',
    cameraHint: '将 Google Authenticator 导出的二维码对准方框',
    cameraStarting: '正在启动摄像头...',
    cameraClose: '关闭摄像头',
    cameraError: '无法访问摄像头，请检查浏览器权限，或直接上传二维码截图',
    textPlaceholder: '粘贴 Google Authenticator 导出的链接 (otpauth-migration://offline?data=...) 或原始 data 参数',
    textParseBtn: '解析并解密',
    parseNoAccounts: '解析成功，但该二维码中未包含任何 OTP 账户。',
    parseFailed: '解密失败',
    qrScanFailed: '二维码识别失败',

    decryptedCount: (count: number) => `已解密令牌 (${count})`,
    batchBadge: (current: number, total: number) => `批次 ${current} / ${total}`,
    searchPlaceholder: '搜索服务或账号...',
    appendBtn: '追加二维码',
    appendTip: 'Google 导出账号较多时可能会生成多张二维码，可继续扫描追加',
    exportBtn: '批量导出',
    noMatch: '未匹配到符合搜索条件的账号',

    unknownService: '未知服务',
    unnamedAccount: '未命名账户',
    viewQrTitle: '查看并扫码导入',
    copyCodeTitle: '点击复制动态口令',
    codeCopied: '已复制',
    copyUri: '复制 otpauth URI',
    copiedUri: '已复制 URI',
    showQr: '显示二维码',
    secretLabel: '密钥:',
    showSecret: '显示密钥明文',
    hideSecret: '隐藏密钥',

    qrModalTip: '使用 1Password / Bitwarden / Microsoft / 2FAS 扫描此二维码直接导入',
    secretPlaintext: 'Base32 密钥明文 (Secret)',
    algoDigits: '算法 / 位数：',
    typePeriod: '类型 / 周期：',
    digitsSuffix: '位',
    saveQrPng: '保存二维码 PNG',
    copyUriBtn: '复制 otpauth URI',
    copiedUriBtn: '已复制 URI',

    exportModalTitle: '批量导出令牌',
    exportModalDesc: (count: number) => `共计 ${count} 个解密令牌，可保存为文本、JSON 或 CSV`,
    downloadJson: '下载 JSON 文件',
    downloadCsv: '下载 CSV 表格',
    downloadTxt: '下载 URI 列表 (.txt)',
    copyAll: '复制全部 URI',
    copiedAll: '已复制全部',

    footerPrivacy: 'GoogleOTP2Other · 本地纯离线处理，保障凭据安全私密',
  },
  en: {
    subtitle: 'Google OTP Migration Decryptor',
    offlineBadge: 'Local & Offline · Zero Data Upload',
    resetBtn: 'Clear & Restart',
    resetConfirm: 'Are you sure you want to clear all decrypted OTP data?',
    githubRepo: 'GitHub Repo',

    heroTitle: 'Google Authenticator Migration Decryptor',
    heroDesc: 'Scan or upload migration QR codes exported from Google Authenticator to automatically unpack and generate standard TOTP QR codes for 1Password, Bitwarden, Microsoft Authenticator, 2FAS, and more.',

    scannerStep1: 'Step 1: Load Google Migration QR Code',
    scannerAppend: 'Scan Additional Batch QR Code',
    cancel: 'Cancel',
    tabUpload: 'Upload / Paste Image',
    tabCamera: 'Camera Scan',
    tabText: 'Migration Link',
    uploadTitle: 'Click or drop Google Authenticator export QR code here',
    uploadProcessing: 'Decrypting QR code...',
    uploadHint: 'Supports PNG, JPG, WebP · Press ⌘V / Ctrl+V to paste screenshot directly',
    cameraHint: 'Point your camera at the Google Authenticator export QR code',
    cameraStarting: 'Initializing camera...',
    cameraClose: 'Close Camera',
    cameraError: 'Unable to access camera. Please check browser permissions or upload a screenshot.',
    textPlaceholder: 'Paste Google Authenticator migration URI (otpauth-migration://offline?data=...) or raw data parameter',
    textParseBtn: 'Unpack & Decrypt',
    parseNoAccounts: 'Parsed successfully, but no OTP accounts were found in this QR code.',
    parseFailed: 'Decryption failed',
    qrScanFailed: 'Failed to recognize QR code',

    decryptedCount: (count: number) => `Decrypted Tokens (${count})`,
    batchBadge: (current: number, total: number) => `Batch ${current} of ${total}`,
    searchPlaceholder: 'Search service or account...',
    appendBtn: 'Append QR',
    appendTip: 'If Google Authenticator generated multiple QR codes, scan them here to merge',
    exportBtn: 'Batch Export',
    noMatch: 'No matching accounts found',

    unknownService: 'Unknown Service',
    unnamedAccount: 'Unnamed Account',
    viewQrTitle: 'View & scan QR code',
    copyCodeTitle: 'Click to copy TOTP code',
    codeCopied: 'Copied',
    copyUri: 'Copy otpauth URI',
    copiedUri: 'Copied URI',
    showQr: 'Show QR Code',
    secretLabel: 'Secret:',
    showSecret: 'Show secret key',
    hideSecret: 'Hide secret key',

    qrModalTip: 'Scan this QR code with 1Password, Bitwarden, Microsoft Authenticator, or 2FAS',
    secretPlaintext: 'Base32 Secret Key',
    algoDigits: 'Algorithm / Digits:',
    typePeriod: 'Type / Period:',
    digitsSuffix: ' digits',
    saveQrPng: 'Save QR as PNG',
    copyUriBtn: 'Copy otpauth URI',
    copiedUriBtn: 'Copied URI',

    exportModalTitle: 'Batch Export Tokens',
    exportModalDesc: (count: number) => `${count} decrypted tokens total. Export as Plaintext, JSON, or CSV`,
    downloadJson: 'Download JSON',
    downloadCsv: 'Download CSV',
    downloadTxt: 'Download URI List (.txt)',
    copyAll: 'Copy All URIs',
    copiedAll: 'Copied All',

    footerPrivacy: 'GoogleOTP2Other · 100% offline & client-side processing for credential privacy',
  },
}

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | null>(null)

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('googleotp2other_lang')
    if (saved === 'zh' || saved === 'en') return saved
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')) {
      return 'zh'
    }
    return 'en'
  })

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('googleotp2other_lang', newLang)
    document.documentElement.lang = newLang
  }

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh')
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
