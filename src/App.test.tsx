import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import App from "./App"

describe("ENPAC", () => {
  it("renders the existing home page", () => {
    render(<App />)

    expect(
      screen.getByRole("heading", { name: /memória em\s*movimento/i }),
    ).not.toBeNull()
  })

  it("draws the complete ENPAC 2026 wordmark on initial load", () => {
    render(<App />)

    const brandButton = screen.getByRole("button", {
      name: "Ir para a Página Inicial",
    })
    const wordmark = within(brandButton).getByRole("img", {
      name: "ENPAC 2026",
    })

    expect(wordmark.classList.contains("stroke-text")).toBe(true)
    expect(wordmark.getAttribute("data-trigger")).toBe("mount")
  })

  it("adds the shiny treatment only to the header registration label", () => {
    render(<App />)

    const header = screen.getByRole("banner")
    const registration = within(header).getByRole("button", {
      name: "Inscrições em breve",
    })

    expect(registration.querySelector(".shiny-text")).not.toBeNull()
  })

  it("makes the home closing title react to pointer proximity", () => {
    render(<App />)

    const title = screen.getByRole("heading", {
      name: "O próximo encontro começa por aqui.",
    })

    expect(title.querySelector(".variable-proximity")).not.toBeNull()
  })
})
