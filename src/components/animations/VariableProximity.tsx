import { Fragment, useEffect, useRef, type RefObject } from "react"

import "./VariableProximity.css"

type Falloff = "linear" | "exponential" | "gaussian"

type VariableProximityProps = {
  label: string
  containerRef?: RefObject<HTMLElement | null>
  fromFontVariationSettings?: string
  toFontVariationSettings?: string
  radius?: number
  falloff?: Falloff
  smoothing?: number
  className?: string
}

const parseSettings = (settings: string) =>
  new Map(
    settings.split(",").map((setting) => {
      const [axis, value] = setting.trim().split(/\s+/)
      return [axis.replace(/["']/g, ""), Number(value)]
    }),
  )

function strengthAt(distance: number, radius: number, falloff: Falloff) {
  if (distance >= radius) return 0
  const strength = 1 - distance / radius
  if (falloff === "exponential") return strength * strength
  if (falloff === "gaussian") {
    const edge = Math.exp(-2)
    return (Math.exp(-2 * (distance / radius) ** 2) - edge) / (1 - edge)
  }
  return strength
}

export default function VariableProximity({
  label,
  containerRef,
  fromFontVariationSettings = "'wght' 500",
  toFontVariationSettings = "'wght' 700",
  radius = 130,
  falloff = "gaussian",
  smoothing = 0.18,
  className = "",
}: VariableProximityProps) {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const letters = letterRefs.current.filter(
      (letter): letter is HTMLSpanElement => Boolean(letter),
    )
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (!letters.length || reducedMotion) return

    const from = parseSettings(fromFontVariationSettings)
    const to = parseSettings(toFontVariationSettings)
    const axes = Array.from(from.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: to.get(axis) ?? fromValue,
    }))
    const levels = new Array(letters.length).fill(0)
    const targets = new Array(letters.length).fill(0)
    let animationFrame = 0

    const settingsAt = (level: number) =>
      axes
        .map(
          ({ axis, fromValue, toValue }) =>
            `'${axis}' ${fromValue + (toValue - fromValue) * level}`,
        )
        .join(", ")

    const animate = () => {
      animationFrame = 0
      let unsettled = false

      letters.forEach((letter, index) => {
        const current = levels[index]
        const target = targets[index]
        const next = current + (target - current) * (1 - smoothing)
        levels[index] = Math.abs(target - next) < 0.002 ? target : next
        letter.style.fontVariationSettings = settingsAt(levels[index])
        unsettled ||= levels[index] !== target
      })

      if (unsettled) animationFrame = window.requestAnimationFrame(animate)
    }

    const schedule = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animate)
    }

    const reset = () => {
      targets.fill(0)
      schedule()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = containerRef?.current?.getBoundingClientRect()
      if (bounds) {
        const dx = Math.max(bounds.left - event.clientX, 0, event.clientX - bounds.right)
        const dy = Math.max(bounds.top - event.clientY, 0, event.clientY - bounds.bottom)
        if (Math.hypot(dx, dy) >= radius) {
          reset()
          return
        }
      }

      letters.forEach((letter, index) => {
        const bounds = letter.getBoundingClientRect()
        const distance = Math.hypot(
          event.clientX - (bounds.left + bounds.width / 2),
          event.clientY - (bounds.top + bounds.height / 2),
        )
        targets[index] = strengthAt(distance, radius, falloff)
      })
      schedule()
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", reset)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("pointermove", handlePointerMove)
      document.documentElement.removeEventListener("pointerleave", reset)
    }
  }, [
    containerRef,
    falloff,
    fromFontVariationSettings,
    radius,
    smoothing,
    toFontVariationSettings,
  ])

  let letterIndex = 0

  return (
    <span className={`variable-proximity ${className}`.trim()}>
      {label.split(" ").map((word, wordIndex, words) => (
        <Fragment key={`${word}-${wordIndex}`}>
          <span className="variable-proximity__word" aria-hidden="true">
            {Array.from(word).map((letter) => {
              const index = letterIndex++
              return (
                <span
                  className="variable-proximity__letter"
                  key={`${letter}-${index}`}
                  ref={(element) => {
                    letterRefs.current[index] = element
                  }}
                  style={{ fontVariationSettings: fromFontVariationSettings }}
                >
                  {letter}
                </span>
              )
            })}
          </span>
          {wordIndex < words.length - 1 ? " " : null}
        </Fragment>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
}
