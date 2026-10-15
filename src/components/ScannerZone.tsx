import { useState, useRef, useEffect, type FC, type ChangeEvent, type FormEvent, type DragEvent } from 'react'
import {
  Upload,
  Camera,
  Link as LinkIcon,
  X,
  AlertCircle,
  FileImage,
  ClipboardPaste,
} from 'lucide-react'
import { scanQrFromImageFile, scanQrFromVideo } from '../lib/qr'

interface ScannerZoneProps {
  onScanSuccess: (rawUri: string) => void
}

export const ScannerZone: FC<ScannerZoneProps> = ({ onScanSuccess }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'text'>('upload')
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Handle Clipboard Paste anywhere on window
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      setError(null)
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleProcessFile(file)
            return
          }
        }
      }

      // Check for pasted text
      const pastedText = e.clipboardData?.getData('text')
      if (pastedText && pastedText.trim().startsWith('otpauth-migration://')) {
        setTextInput(pastedText.trim())
        try {
          onScanSuccess(pastedText.trim())
        } catch (err: any) {
          setError(err.message || '解析失败')
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [onScanSuccess])

  // Stop camera when switching tab or unmounting
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
    }
    setIsCameraActive(false)
  }

  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera()
    }
    return () => stopCamera()
  }, [activeTab])

  // Start Camera
  const startCamera = async () => {
    setError(null)
    setIsCameraActive(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      cameraStreamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        // Start scanning loop
        scanIntervalRef.current = window.setInterval(() => {
          if (videoRef.current) {
            const qrText = scanQrFromVideo(videoRef.current)
            if (qrText) {
              stopCamera()
              onScanSuccess(qrText)
            }
          }
        }, 200)
      }
    } catch (err: any) {
      stopCamera()
      setError('无法访问摄像头，请检查浏览器权限，或直接上传二维码截图')
    }
  }

  // Handle File
  const handleProcessFile = async (file: File) => {
    setError(null)
    setIsProcessing(true)
    try {
      const qrData = await scanQrFromImageFile(file)
      onScanSuccess(qrData)
    } catch (err: any) {
      setError(err.message || '二维码识别失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return
    setError(null)
    try {
      onScanSuccess(textInput.trim())
    } catch (err: any) {
      setError(err.message || '解析失败')
    }
  }

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-[#232530] pb-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-[#1e202f] text-[#f4f4f5] border border-[#343852]'
                : 'text-[#858b9c] hover:text-[#c4c9d8] hover:bg-[#14151e]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>上传 / 粘贴图片</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera')
              startCamera()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'camera'
                ? 'bg-[#1e202f] text-[#f4f4f5] border border-[#343852]'
                : 'text-[#858b9c] hover:text-[#c4c9d8] hover:bg-[#14151e]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>摄像头扫码</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'text'
                ? 'bg-[#1e202f] text-[#f4f4f5] border border-[#343852]'
                : 'text-[#858b9c] hover:text-[#c4c9d8] hover:bg-[#14151e]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>文本链接</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#5e6ad2] bg-[#161826]'
              : 'border-[#262938] hover:border-[#3d425c] bg-[#101119]/60 hover:bg-[#13141f]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-[#1b1d2a] border border-[#2c3046] flex items-center justify-center text-[#7e8ce0] mb-3">
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-[#7e8ce0] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileImage className="w-6 h-6" />
            )}
          </div>

          <div className="text-sm font-medium text-[#ededef] mb-1">
            {isProcessing ? '正在解密二维码...' : '点击或拖拽上传 Google 导出的二维码'}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6e7487] mt-1">
            <span>支持 PNG, JPG, WebP 格式</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#8790aa]">
              <ClipboardPaste className="w-3 h-3" /> 支持直接按 ⌘V / Ctrl+V 粘贴截图
            </span>
          </div>
        </div>
      )}

      {/* Camera Zone */}
      {activeTab === 'camera' && (
        <div className="border border-[#262938] rounded-xl bg-[#101119] p-4 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-[#08080c] rounded-lg overflow-hidden border border-[#2d3148] flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target reticle */}
            <div className="absolute inset-10 border-2 border-[#5e6ad2]/70 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-[#5e6ad2] shadow-[0_0_8px_#5e6ad2] animate-pulse" />
            </div>

            {!isCameraActive && (
              <div className="absolute inset-0 bg-[#08080c]/90 flex flex-col items-center justify-center text-xs text-[#7d849a]">
                <Camera className="w-8 h-8 mb-2 text-[#464c63]" />
                <span>正在启动摄像头...</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full max-w-md mt-3">
            <span className="text-xs text-[#71778c]">将 Google Authenticator 导出的二维码对准方框</span>
            <button
              onClick={() => {
                stopCamera()
                setActiveTab('upload')
              }}
              className="text-xs text-[#8f96ad] hover:text-[#e4e7f2] flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> 关闭摄像头
            </button>
          </div>
        </div>
      )}

      {/* Text Input Zone */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="粘贴 Google Authenticator 导出的链接 (otpauth-migration://offline?data=...) 或原始 data 参数"
              rows={3}
              className="w-full bg-[#12131d] border border-[#262938] focus:border-[#5e6ad2] rounded-lg p-3 text-xs text-[#e1e4ee] placeholder-[#555a6d] outline-none font-mono resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#5e6ad2] hover:bg-[#6c79e6] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              解析并解密
            </button>
          </div>
        </form>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-[#2b161b] border border-[#52232a] flex items-start gap-2 text-xs text-[#f87171]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-[#f87171]/60 hover:text-[#f87171]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
