import {
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { gsap } from "gsap"

type AnimatedContentProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  distance?: number
  duration?: number
  initialOpacity?: number
  threshold?: number
}

export default function AnimatedContent({
  children,
  distance = 24,
  duration = 0.8,
  initialOpacity = 0.4,
  threshold = 0.12,
  className = "",
  ...props
}: AnimatedContentProps) {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const element = rootRef.current
    if (!element) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reducedMotion) {
      gsap.set(element, { clearProps: "opacity,transform,visibility,willChange" })
      return
    }

    gsap.set(element, {
      y: distance,
      opacity: initialOpacity,
      visibility: "visible",
      willChange: "transform,opacity",
    })

    let tween: gsap.core.Tween | null = null
    const reveal = () => {
      tween?.kill()
      tween = gsap.to(element, {
        y: 0,
        opacity: 1,
        duration,
        ease: "power3.out",
        clearProps: "opacity,transform,visibility,willChange",
      })
    }

    if (!("IntersectionObserver" in window)) {
      reveal()
      return () => tween?.kill()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        reveal()
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold,
      },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      tween?.kill()
    }
  }, [distance, duration, initialOpacity, threshold])

  return (
    <section
      ref={rootRef}
      className={className}
      data-animation="animated-content"
      data-trigger="viewport"
      {...props}
    >
      {children}
    </section>
  )
}
