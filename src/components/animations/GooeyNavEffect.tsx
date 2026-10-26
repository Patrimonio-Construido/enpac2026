import {
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react"
import { gsap } from "gsap"

import "./GooeyNavEffect.css"

type GooeyNavEffectProps = {
  activeIndex: number
  children: ReactNode
}

const particleOffsets = [-7, 5, -4, 8, -6, 4]

export default function GooeyNavEffect({
  activeIndex,
  children,
}: GooeyNavEffectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const previousIndex = useRef(activeIndex)
  const filterId = `gooey-nav-${useId().replaceAll(":", "")}`

  useLayoutEffect(() => {
    const root = rootRef.current
    const layer = layerRef.current
    const indicator = indicatorRef.current
    if (!root || !layer || !indicator) return

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(":scope > button"),
    )
    const desktop = window.matchMedia("(min-width: 1081px)")
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const geometry = (index: number) => {
      const button = buttons[index]
      if (!button) return null
      const height = Math.max(28, button.offsetHeight - 4)
      return {
        x: button.offsetLeft - 8,
        y: button.offsetTop + (button.offsetHeight - height) / 2,
        width: button.offsetWidth + 16,
        height,
      }
    }

    const place = (animate: boolean) => {
      if (!desktop.matches) {
        gsap.set(layer, { display: "none" })
        previousIndex.current = activeIndex
        return
      }

      const next = geometry(activeIndex)
      if (!next) return
      gsap.set(layer, { display: "block" })

      if (!animate || reducedMotion) {
        gsap.set(indicator, next)
        gsap.set(particleRefs.current, { opacity: 0, scale: 0 })
        previousIndex.current = activeIndex
        return
      }

      const previous = geometry(previousIndex.current) ?? next
      const fromX = previous.x + previous.width / 2
      const fromY = previous.y + previous.height / 2
      const toX = next.x + next.width / 2
      const toY = next.y + next.height / 2

      gsap.killTweensOf([indicator, ...particleRefs.current])
      gsap.to(indicator, {
        ...next,
        duration: 0.48,
        ease: "power3.out",
      })

      particleRefs.current.forEach((particle, index) => {
        if (!particle) return
        const progress = (index + 1) / (particleOffsets.length + 1)
        gsap.fromTo(
          particle,
          {
            x: fromX - 3,
            y: fromY - 3,
            opacity: 0.72,
            scale: 1,
          },
          {
            x: fromX + (toX - fromX) * progress - 3,
            y: fromY + (toY - fromY) * progress + particleOffsets[index] - 3,
            opacity: 0,
            scale: 0.25,
            duration: 0.38,
            delay: index * 0.018,
            ease: "power2.out",
          },
        )
      })

      previousIndex.current = activeIndex
    }

    place(previousIndex.current !== activeIndex)

    const resizeObserver = new ResizeObserver(() => place(false))
    const handleDesktopChange = () => place(false)
    resizeObserver.observe(root)
    desktop.addEventListener("change", handleDesktopChange)

    return () => {
      resizeObserver.disconnect()
      desktop.removeEventListener("change", handleDesktopChange)
      gsap.killTweensOf([indicator, ...particleRefs.current])
    }
  }, [activeIndex])

  return (
    <div ref={rootRef} className="nav-links gooey-nav-effect" data-gooey-nav="desktop">
      <svg
        className="gooey-nav-effect__filter"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={filterId} x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span
        ref={layerRef}
        className="gooey-nav-effect__layer"
        data-gooey-layer=""
        aria-hidden="true"
        style={{ filter: `url(#${filterId})` }}
      >
        <span ref={indicatorRef} className="gooey-nav-effect__indicator" />
        {particleOffsets.map((_, index) => (
          <span
            key={index}
            ref={(element) => {
              particleRefs.current[index] = element
            }}
            className="gooey-nav-effect__particle"
          />
        ))}
      </span>
      {children}
    </div>
  )
}
