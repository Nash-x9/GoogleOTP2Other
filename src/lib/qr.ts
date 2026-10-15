import jsQR from 'jsqr'

/**
 * Scan QR code from an HTMLImageElement or ImageData
 */
export function scanQrFromImageData(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  })
  return code ? code.data : null
}

/**
 * Scan QR code from an Image file or Blob
 */
export async function scanQrFromImageFile(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        try {
          const qrText = scanQrFromHtmlImage(img)
          if (qrText) {
            resolve(qrText)
          } else {
            reject(new Error('未在图片中检测到有效的二维码，请确保二维码清晰且完整'))
          }
        } catch (e: any) {
          reject(e)
        }
      }
      img.onerror = () => reject(new Error('图片加载失败，请检查文件格式'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * Scan QR code from HTMLImageElement with multi-scale fallback
 */
export function scanQrFromHtmlImage(img: HTMLImageElement): string | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  // Scales to attempt: 1x, 0.75x, 0.5x, 1.5x (if small)
  const scales = [1.0, 0.8, 0.5, 1.25]

  // If the image is excessively large, cap base dimension to 1600px
  const maxDim = Math.max(img.naturalWidth, img.naturalHeight)
  const baseScale = maxDim > 1600 ? 1600 / maxDim : 1.0

  for (const s of scales) {
    const targetScale = baseScale * s
    const w = Math.round(img.naturalWidth * targetScale)
    const h = Math.round(img.naturalHeight * targetScale)
    if (w < 40 || h < 40) continue

    canvas.width = w
    canvas.height = h
    ctx.drawImage(img, 0, 0, w, h)

    const imageData = ctx.getImageData(0, 0, w, h)
    const text = scanQrFromImageData(imageData)
    if (text) {
      return text
    }
  }

  return null
}

/**
 * Scan video frame from an active HTMLVideoElement
 */
export function scanQrFromVideo(video: HTMLVideoElement): string | null {
  if (video.readyState !== video.HAVE_ENOUGH_DATA) return null

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return scanQrFromImageData(imageData)
}
