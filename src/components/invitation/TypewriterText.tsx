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
  const tokens = text.split(/(\s+)/)
  let characterIndex = 0

  function renderCharacter(ch: string, index: number) {
    const decorated = decorateChar?.index === index

    return (
      <span
        key={`${index}-${ch}`}
        className={[
          'typewriter__char',
          active ? 'typewriter__char--run' : '',
          decorated ? 'typewriter__char--decorated' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          {
            '--char-delay': `${startDelay + index * charDelay}ms`,
          } as CSSProperties
        }
      >
        {ch === ' ' ? '\u00A0' : ch}
        {decorated ? decorateChar.node : null}
      </span>
    )
  }

  return (
    <Tag
      className={`typewriter${className ? ` ${className}` : ''}`}
      style={style}
      aria-label={text}
    >
      {tokens.map((token, tokenIndex) => {
        const tokenChars = Array.from(token)
        const tokenStart = characterIndex
        characterIndex += tokenChars.length

        if (/^\s+$/.test(token)) {
          return tokenChars.map((ch, index) =>
            renderCharacter(ch, tokenStart + index),
          )
        }

        return (
          <span className="typewriter__word" key={`${tokenIndex}-${token}`}>
            {tokenChars.map((ch, index) =>
              renderCharacter(ch, tokenStart + index),
            )}
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
