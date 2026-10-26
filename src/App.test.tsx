import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
    expect(screen.getByRole("contentinfo").querySelector(".stroke-text")).toBeNull()
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

  it("keeps the current page mounted while the GSAP exit transition runs", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "Palestrantes",
      }),
    )

    expect(
      screen.getByRole("heading", { name: /memória em\s*movimento/i }),
    ).not.toBeNull()
    await waitFor(
      () =>
        expect(
          screen.getByRole("heading", { name: "Palestrantes" }),
        ).not.toBeNull(),
      { timeout: 1000 },
    )
  })

  it("uses GSAP to reveal the mobile navigation", async () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("max-width"),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList

    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole("button", { name: "Abrir menu" })

    await user.click(toggle)

    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    })

    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(navigation.getAttribute("data-mobile-animation")).toBe("gsap")
    expect(navigation.style.visibility).toBe("visible")

    window.matchMedia = originalMatchMedia
  })
})
