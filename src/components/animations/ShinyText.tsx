import type { CSSProperties, ReactNode } from "react"

import "./ShinyText.css"

type ShinyTextProps = {
  children: ReactNode
  color?: string
  shineColor?: string
  speed?: number
  className?: string
}

export default function ShinyText({
  children,
  color = "currentColor",
  shineColor = "#ffffff",
  speed = 3,
  className = "",
}: ShinyTextProps) {
  return (
    <span
      className={`shiny-text ${className}`.trim()}
      style={
        {
          "--shiny-base": color,
          "--shiny-highlight": shineColor,
          "--shiny-duration": `${Math.max(speed, 0.5)}s`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  )
}
