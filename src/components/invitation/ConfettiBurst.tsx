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
  '#5b7a9d',
  '#3f5a78',
  '#0a1628',
  '#ffffff',
  '#e8c547',
]

function spawnFromSide(
  w: number,
  h: number,
  side: 'left' | 'right',
  count: number,
): Particle[] {
  const list: Particle[] = []
  const fromLeft = side === 'left'
  const originX = fromLeft ? -8 : w + 8
  const originY = h * (0.02 + Math.random() * 0.08)

  for (let i = 0; i < count; i++) {
    // Bắn từ 2 góc trên vào giữa / xuống dưới
    const inward = fromLeft
      ? Math.PI * (0.05 + Math.random() * 0.4)
      : Math.PI * (0.55 + Math.random() * 0.4)
    const speed = 8 + Math.random() * 12
    const shapes: Particle['shape'][] = ['rect', 'circle', 'ribbon']
    list.push({
      x: originX + (Math.random() - 0.5) * 24,
      y: originY + Math.random() * h * 0.12,
      vx: Math.cos(inward) * speed * (fromLeft ? 1 : 1),
      vy: Math.sin(inward) * speed * 0.85 + Math.random() * 2,
      w: 4 + Math.random() * 7,
      h: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.005 + Math.random() * 0.007,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })
  }
  return list
}

function spawnBurst(w: number, h: number): Particle[] {
  return [
    ...spawnFromSide(w, h, 'left', 75),
    ...spawnFromSide(w, h, 'right', 75),
  ]
}

interface ConfettiBurstProps {
  active: boolean
}

/** Pháo giấy chúc mừng — vàng / xanh UTC2 */
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
      const w = parent?.clientWidth || window.innerWidth
      const h = parent?.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }
    }

    fit()
    particlesRef.current = spawnBurst(sizeRef.current.w, sizeRef.current.h)

    const gravity = 0.18
    const drag = 0.992

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
