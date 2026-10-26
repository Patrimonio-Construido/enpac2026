import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"

import "./StrokeText.css"

type StrokeTextProps = {
  text: string
  strokeColor?: string
  strokeWidth?: number
  duration?: number
  delay?: number
  className?: string
}

export default function StrokeText({
  text,
  strokeColor = "currentColor",
  strokeWidth = 0.8,
  duration = 0.9,
  delay = 0,
  className = "",
}: StrokeTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const textNode = textRef.current
    if (!root || !textNode) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (reduceMotion) {
      gsap.set(textNode, {
        clearProps:
          "clipPath,webkitTextFillColor,webkitTextStrokeColor,webkitTextStrokeWidth",
      })
      return
    }

    const resolvedStrokeColor =
      strokeColor === "currentColor"
        ? window.getComputedStyle(textNode).color
        : strokeColor

    const context = gsap.context(() => {
      gsap.set(textNode, {
        clipPath: "inset(0 100% 0 0)",
        webkitTextFillColor: "transparent",
        webkitTextStrokeColor: resolvedStrokeColor,
        webkitTextStrokeWidth: `${strokeWidth}px`,
      })

      gsap
        .timeline({ delay })
        .to(textNode, {
          clipPath: "inset(0 0% 0 0)",
          duration,
          ease: "power2.out",
        })
        .to(
          textNode,
          {
            webkitTextFillColor: resolvedStrokeColor,
            webkitTextStrokeWidth: "0px",
            duration: 0.28,
            ease: "power1.out",
          },
          "-=0.2",
        )
        .set(textNode, {
          clearProps:
            "clipPath,webkitTextFillColor,webkitTextStrokeColor,webkitTextStrokeWidth",
        })
    }, root)

    return () => context.revert()
  }, [delay, duration, strokeColor, strokeWidth])

  return (
    <span
      ref={rootRef}
      className={`stroke-text-part ${className}`.trim()}
      aria-hidden="true"
    >
      <span
        ref={textRef}
        data-brand-original=""
        data-stroke-animated=""
        data-stroke-fill=""
      >
        {text}
      </span>
    </span>
  )
}
