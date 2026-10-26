import { useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"

import "./StrokeText.css"

type StrokeTextProps = {
  text: string
  strokeColor?: string
  fillColor?: string
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
  fillColor = "currentColor",
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
    const fill = root.querySelector<SVGElement>("[data-stroke-fill]")
    const dash = Math.max(fontSize * 7, 200)
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (reduceMotion) {
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 })
      gsap.set(fill, { opacity: 1 })
      return
    }

    const context = gsap.context(() => {
      gsap.set(strokes, {
        strokeDasharray: dash,
        strokeDashoffset: dash,
        strokeOpacity: 1,
      })
      gsap.set(fill, { opacity: 0 })

      gsap
        .timeline({ delay })
        .to(strokes, {
          strokeDashoffset: 0,
          duration,
          ease: "power2.out",
          stagger: 0.035,
        })
        .to(fill, { opacity: 1, duration: 0.28, ease: "power1.out" }, "-=0.2")
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
      style={{ fontSize: `${fontSize}px` }}
      aria-hidden="true"
    >
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
        <text
          data-stroke-fill=""
          x="0"
          y="0"
          fill={fillColor}
          stroke="none"
          style={textStyle}
        >
          {text}
        </text>
      </svg>
    </span>
  )
}
