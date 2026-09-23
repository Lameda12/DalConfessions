import type { Post } from '@/types'
import { CATEGORY_BY_SLUG } from '@/data/categories'

const WIDTH = 1080
const HEIGHT = 1350

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

/** Renders a shareable 4:5 image card for a confession (Stories/WhatsApp). */
export function renderShareCard(post: Post): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas not supported'))

  ctx.fillStyle = '#1c1c1e'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const gradient = ctx.createRadialGradient(WIDTH * 0.85, 120, 40, WIDTH * 0.85, 120, 700)
  gradient.addColorStop(0, 'rgba(248,186,21,0.25)')
  gradient.addColorStop(1, 'rgba(248,186,21,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = '#f8ba15'
  ctx.font = '700 34px "Plus Jakarta Sans", sans-serif'
  ctx.fillText('DalConfessions', 72, 130)

  const category = CATEGORY_BY_SLUG[post.category]
  ctx.font = '600 28px "Inter", sans-serif'
  ctx.fillStyle = 'rgba(250,248,244,0.65)'
  ctx.fillText(`${category.emoji}  ${category.label}`, 72, 180)

  ctx.fillStyle = '#faf8f4'
  ctx.font = '600 54px "Plus Jakarta Sans", sans-serif'
  const maxWidth = WIDTH - 144
  const lines = wrapText(ctx, post.content, maxWidth).slice(0, 12)
  let y = 320
  const lineHeight = 68
  for (const line of lines) {
    ctx.fillText(line, 72, y)
    y += lineHeight
  }

  const statsY = HEIGHT - 140
  ctx.font = '600 32px "Inter", sans-serif'
  ctx.fillStyle = '#f8ba15'
  ctx.fillText(`▲ ${post.upvotes - post.downvotes}`, 72, statsY)

  ctx.font = '500 26px "Inter", sans-serif'
  ctx.fillStyle = 'rgba(250,248,244,0.5)'
  ctx.fillText('Whispered anonymously at Dal', 72, HEIGHT - 72)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to render image'))
    }, 'image/png')
  })
}
