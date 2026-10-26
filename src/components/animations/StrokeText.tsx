import { useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"

import "./StrokeText.css"

type StrokeTextProps = {
  text: string
  strokeColor?: string
  fontFamily?: string
  fontSize: number
  fontWeight?: number
  letterSpacing?: number
  strokeWidth?: number
  duration?: number
  delay?: number
  className?: string
}

type TextBox = {
  x: number
  y: number
  width: number
  height: number
}

export default function StrokeText({
  text,
  strokeColor = "currentColor",
  fontFamily = "inherit",
  fontSize,
  fontWeight = 600,
  letterSpacing = 0,
  strokeWidth = 0.8,
  duration = 0.9,
  delay = 0,
  className = "",
}: StrokeTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const [box, setBox] = useState<TextBox | null>(null)
  const characters = Array.from(text)

  useLayoutEffect(() => {
    const textNode = textRef.current
    if (!textNode) return

    const measure = () => {
      try {
        const bounds = textNode.getBBox()
        if (!bounds.width) return
        const padding = Math.max(strokeWidth * 2, fontSize * 0.05)
        setBox({
          x: bounds.x - padding,
          y: bounds.y - padding,
          width: bounds.width + padding * 2,
          height: bounds.height + padding * 2,
        })
      } catch {
        // SVG measurement is unavailable in non-visual test environments.
      }
    }

    measure()
    document.fonts?.ready.then(measure).catch(() => undefined)
  }, [fontSize, letterSpacing, strokeWidth, text])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !box) return

    const strokes = root.querySelectorAll<SVGElement>("[data-stroke-char]")
    const original = root.querySelector<HTMLElement>("[data-brand-original]")
    const overlay = root.querySelector<SVGElement>(".stroke-text-part__svg")
    const dash = Math.max(fontSize * 7, 200)
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (reduceMotion) {
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 })
      gsap.set(original, { opacity: 1 })
      gsap.set(overlay, { display: "none" })
      return
    }

    const context = gsap.context(() => {
      gsap.set(strokes, {
        strokeDasharray: dash,
        strokeDashoffset: dash,
        strokeOpacity: 1,
      })
      gsap.set(original, { opacity: 0 })
      gsap.set(overlay, { display: "block", opacity: 1 })

      gsap
        .timeline({ delay })
        .to(strokes, {
          strokeDashoffset: 0,
          duration,
          ease: "power2.out",
          stagger: 0.035,
        })
        .to(
          original,
          { opacity: 1, duration: 0.28, ease: "power1.out" },
          "-=0.2",
        )
        .to(overlay, { opacity: 0, duration: 0.18, ease: "power1.out" }, "<")
        .set(overlay, { display: "none" })
    }, root)

    return () => context.revert()
  }, [box, delay, duration, fontSize])

  const textStyle = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing: `${letterSpacing}px`,
  }
  const fallbackWidth = Math.max(fontSize, text.length * fontSize * 0.62)
  const viewBox = box
    ? `${box.x} ${box.y} ${box.width} ${box.height}`
    : `0 ${-fontSize} ${fallbackWidth} ${fontSize * 1.3}`

  return (
    <span
      ref={rootRef}
      className={`stroke-text-part ${className}`.trim()}
      aria-hidden="true"
    >
      <span data-brand-original="" data-stroke-fill="">
        {text}
      </span>
      <svg
        className="stroke-text-part__svg"
        viewBox={viewBox}
        preserveAspectRatio="xMinYMid meet"
        style={box ? undefined : { visibility: "hidden" }}
      >
        <text
          ref={textRef}
          x="0"
          y="0"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={textStyle}
        >
          {characters.map((character, index) => (
            <tspan data-stroke-char="" key={`${character}-${index}`}>
              {character}
            </tspan>
          ))}
        </text>
      </svg>
    </span>
  )
}
