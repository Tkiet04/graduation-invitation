import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  life: number
  decay: number
  shape: 'rect' | 'circle' | 'ribbon'
}

const COLORS = [
  '#d4af37',
  '#f0d878',
  '#9a7410',
  '#ffffff',
  '#e8c547',
  '#7a99b6',
  '#3f5a78',
  '#ffeb99',
]

/**
 * Pháo hoa bắn bùng nổ trực tiếp TỪ MIỆNG PHONG BÌ trên thiệp
 * (Không bắn từ rìa màn hình đen bên ngoài)
 */
function spawnEnvelopeBurst(w: number, h: number): Particle[] {
  const list: Particle[] = []
  const shapes: Particle['shape'][] = ['rect', 'circle', 'ribbon']

  // 1. Pháo nổ chính từ miệng phong bì ở giữa thiệp (vị trí ~55%-60% chiều cao)
  // Bắn tỏa hình nan quạt vút lên trời
  for (let i = 0; i < 95; i++) {
    // Góc bắn vút lên: từ -25° đến -155°
    const angle = -Math.PI * (0.16 + Math.random() * 0.68)
    const speed = 8 + Math.random() * 14
    const originX = w * (0.38 + Math.random() * 0.24)
    const originY = h * (0.54 + Math.random() * 0.08)

    list.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 4 + Math.random() * 6,
      h: 6 + Math.random() * 9,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.007 + Math.random() * 0.008,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })
  }

  // 2. Hai cụm pháo phụ bắn chéo từ 2 bên mép nắp phong bì
  for (let i = 0; i < 28; i++) {
    // Bên trái bắn chéo lên sang phải
    const angleLeft = -Math.PI * (0.2 + Math.random() * 0.32)
    const speedLeft = 6 + Math.random() * 11
    list.push({
      x: w * (0.16 + Math.random() * 0.08),
      y: h * (0.47 + Math.random() * 0.06),
      vx: Math.cos(angleLeft) * speedLeft,
      vy: Math.sin(angleLeft) * speedLeft,
      w: 4 + Math.random() * 5,
      h: 5 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.008 + Math.random() * 0.008,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })

    // Bên phải bắn chéo lên sang trái
    const angleRight = -Math.PI * (0.48 + Math.random() * 0.32)
    const speedRight = 6 + Math.random() * 11
    list.push({
      x: w * (0.76 + Math.random() * 0.08),
      y: h * (0.47 + Math.random() * 0.06),
      vx: Math.cos(angleRight) * speedRight,
      vy: Math.sin(angleRight) * speedRight,
      w: 4 + Math.random() * 5,
      h: 5 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.008 + Math.random() * 0.008,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })
  }

  return list
}

interface ConfettiBurstProps {
  active: boolean
}

/** Pháo giấy chúc mừng — vàng & ánh kim UTC2 bắn từ chính phong bì */
export function ConfettiBurst({ active }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fit = () => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth || canvas.clientWidth || 420
      const h = parent?.clientHeight || canvas.clientHeight || 746
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }
    }

    fit()
    particlesRef.current = spawnEnvelopeBurst(sizeRef.current.w, sizeRef.current.h)

    const gravity = 0.22
    const drag = 0.988

    const frame = () => {
      const { w, h } = sizeRef.current
      ctx.clearRect(0, 0, w, h)

      let alive = 0
      for (const p of particlesRef.current) {
        if (p.life <= 0) continue
        alive++
        p.vy += gravity
        p.vx *= drag
        p.vy *= drag
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= p.decay

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'ribbon') {
          ctx.fillRect(-p.w * 0.2, -p.h * 0.6, p.w * 0.4, p.h * 1.2)
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(frame)
      }
    }

    rafRef.current = requestAnimationFrame(frame)
    window.addEventListener('resize', fit)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', fit)
      particlesRef.current = []
    }
  }, [active])

  if (!active) return null

  return <canvas ref={canvasRef} className="env-confetti" aria-hidden="true" />
}
