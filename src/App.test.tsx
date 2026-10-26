import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import App from "./App"

describe("ENPAC", () => {
  it("renders the existing home page", () => {
    render(<App />)

    expect(
      screen.getByRole("heading", { name: /memória em\s*movimento/i }),
    ).not.toBeNull()
  })
})
