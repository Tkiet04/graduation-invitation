import type { CSSProperties, ElementType, ReactNode } from 'react'

interface TypewriterTextProps {
  text: string
  as?: ElementType
  className?: string
  /** When false, characters stay hidden */
  active?: boolean
  /** Delay before first character (ms) */
  startDelay?: number
  /** Delay between characters (ms) */
  charDelay?: number
  style?: CSSProperties
  /** Optional decoration anchored to a character index (moves with that glyph). */
  decorateChar?: {
    index: number
    node: ReactNode
  }
}

/** Renders full text in place; each character fades into its final slot. */
export function TypewriterText({
  text,
  as: Tag = 'span',
  className = '',
  active = true,
  startDelay = 0,
  charDelay = 28,
  style,
  decorateChar,
}: TypewriterTextProps) {
  const chars = Array.from(text)

  return (
    <Tag
      className={`typewriter${className ? ` ${className}` : ''}`}
      style={style}
      aria-label={text}
    >
      {chars.map((ch, i) => {
        const decorated = decorateChar?.index === i
        return (
          <span
            key={`${i}-${ch}`}
            className={[
              'typewriter__char',
              active ? 'typewriter__char--run' : '',
              decorated ? 'typewriter__char--decorated' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              {
                '--char-delay': `${startDelay + i * charDelay}ms`,
              } as CSSProperties
            }
          >
            {ch === ' ' ? '\u00A0' : ch}
            {decorated ? decorateChar.node : null}
          </span>
        )
      })}
    </Tag>
  )
}

/** Total duration to finish typing a string. */
export function typewriterDuration(
  text: string,
  startDelay = 0,
  charDelay = 28,
): number {
  return startDelay + Math.max(0, Array.from(text).length) * charDelay
}
