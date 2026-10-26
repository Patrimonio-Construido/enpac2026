import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"

import StrokeText from "./components/animations/StrokeText"
import ShinyText from "./components/animations/ShinyText"
import VariableProximity from "./components/animations/VariableProximity"

type Page = "inicio" | "palestrantes" | "programacao" | "edicoes"

type ScheduleItem = {
  time: string
  type: string
  title: string
}

const pages: { id: Page label: string }[] = [
  { id: "inicio", label: "Página Inicial" },
  { id: "palestrantes", label: "Palestrantes" },
  { id: "programacao", label: "Programação" },
  { id: "edicoes", label: "Edições Anteriores" },
]

const photos = {
  blueDoor:
    "https://images.unsplash.com/photo-1647869668521-c0486729d0dc?auto=format&fit=crop&w=1400&q=85",
  street:
    "https://images.unsplash.com/photo-1689936152585-0913f81c62e5?auto=format&fit=crop&w=1400&q=85",
  oldDoor:
    "https://images.unsplash.com/photo-1626125937207-9b8f176d9f3a?auto=format&fit=crop&w=1200&q=85",
  arch: "https://images.unsplash.com/photo-1668715590722-9b10644387cd?auto=format&fit=crop&w=1400&q=85",
}

const speakerPlaceholders = Array.from({ length: 6 }, (_, index) => ({
  number: String(index + 1).padStart(2, "0"),
  image: [photos.oldDoor, photos.blueDoor, photos.arch][index % 3],
}))

const schedule: ScheduleItem[][] = [
  [
    { time: "09:00", type: "Abertura", title: "Boas-vindas ao ENPAC 2026" },
    {
      time: "10:00",
      type: "Conferência",
      title: "Tema da conferência a confirmar",
    },
    {
      time: "14:00",
      type: "Mesa-redonda",
      title: "Tema da mesa-redonda a confirmar",
    },
    { time: "16:30", type: "Debate", title: "Conversa com participantes" },
  ],
  [
    { time: "09:00", type: "Conferência", title: "Tema a confirmar" },
    {
      time: "11:00",
      type: "Sessão temática",
      title: "Pesquisas e práticas em patrimônio",
    },
    { time: "14:00", type: "Oficina", title: "Atividade prática a confirmar" },
    { time: "17:00", type: "Debate", title: "Síntese do segundo dia" },
  ],
  [
    {
      time: "09:00",
      type: "Mesa-redonda",
      title: "Tema da mesa-redonda a confirmar",
    },
    {
      time: "11:30",
      type: "Apresentações",
      title: "Trabalhos e experiências selecionadas",
    },
    {
      time: "15:00",
      type: "Conferência",
      title: "Conferência de encerramento",
    },
    { time: "17:00", type: "Encerramento", title: "Próximos encontros" },
  ],
]

const editions = [
  { year: "2023", image: photos.street, available: true },
  { year: "2021", image: photos.blueDoor, available: false },
  { year: "2019", image: photos.arch, available: false },
  { year: "2018", image: photos.oldDoor, available: false },
]

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14M14 6l6 6-6 6" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`menu-icon ${open ? "is-open" : ""}`} aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function Brand() {
  return (
    <span
      className="brand stroke-text"
      role="img"
      aria-label="ENPAC 2026"
      data-trigger="mount"
    >
      <span className="brand-name">
        <StrokeText
          text="ENPAC"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontSize={32}
          fontWeight={600}
          letterSpacing={-1.28}
          strokeWidth={0.75}
        />
      </span>
      <span className="brand-year">
        <StrokeText
          text="2026"
          fontFamily="Montserrat, Arial, sans-serif"
          fontSize={10.88}
          fontWeight={700}
          letterSpacing={1.52}
          strokeWidth={0.45}
          delay={0.1}
        />
      </span>
    </span>
  )
}

function Header({
  activePage,
  onNavigate,
}: {
  activePage: Page
  onNavigate: (page: Page) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (page: Page) => {
    onNavigate(page)
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="brand-button"
          onClick={() => navigate("inicio")}
          aria-label="Ir para a Página Inicial"
        >
          <Brand />
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span>{menuOpen ? "Fechar" : "Menu"}</span>
          <MenuIcon open={menuOpen} />
        </button>

        <nav
          id="main-navigation"
          className={`main-navigation ${menuOpen ? "is-open" : ""}`}
          aria-label="Navegação principal"
        >
          <div className="nav-links">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={activePage === page.id ? "is-active" : ""}
                aria-current={activePage === page.id ? "page" : undefined}
                onClick={() => navigate(page.id)}
              >
                {page.label}
              </button>
            ))}
          </div>
          <button type="button" className="button button-small button-peach">
            <ShinyText
              color="var(--navy-dark)"
              shineColor="var(--white)"
              speed={3.2}
            >
              Inscrições em breve
            </ShinyText>
          </button>
        </nav>
      </div>
    </header>
  )
}

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-intro">
          <Brand />
          <p>
            Encontro do Patrimônio Construído. Um espaço de troca entre
            pesquisa, prática e preservação.
          </p>
          <span className="footer-note">
            Conteúdo demonstrativo — informações de 2026 em definição.
          </span>
        </div>

        <div className="footer-column">
          <h2>Navegue</h2>
          {pages.map((page) => (
            <button key={page.id} onClick={() => onNavigate(page.id)}>
              {page.label}
            </button>
          ))}
        </div>

        <div className="footer-column">
          <h2>Acompanhe o projeto</h2>
          <a href="mailto:patrimonio.construido2018@gmail.com">
            E-mail do projeto
          </a>
          <a
            href="https://www.instagram.com/projetopatrimonioconstruido/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/projeto.patrimonio.construido/"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.youtube.com/c/patrimonioconstruido"
            target="_blank"
            rel="noreferrer"
          >
            YouTube
          </a>
        </div>
      </div>

      <div className="institutional-row">
        <p>Realização e apoio</p>
        <div className="institutional-logos">
          <img
            src="/brand/projeto-patrimonio-construido.png"
            alt="Projeto Patrimônio Construído"
          />
          <img src="/brand/puc-minas.png" alt="PUC Minas" />
          <img src="/brand/ufmg.png" alt="UFMG" />
        </div>
      </div>

      <div className="footer-bottom">
        <span>ENPAC 2026</span>
        <span>100% online</span>
      </div>
    </footer>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy?: string
}) {
  return (
    <div className="section-heading">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}

function TextLink({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button className="text-link" type="button" onClick={onClick}>
      <span>{children}</span>
      <ArrowIcon />
    </button>
  )
}

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <Eyebrow>Encontro do Patrimônio Construído</Eyebrow>
          <h1>
            Memória em
            <br />
            <em>movimento.</em>
          </h1>
          <p>
            O ENPAC reúne vozes, pesquisas e práticas que pensam o patrimônio
            construído como parte viva do nosso presente.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" type="button">
              Inscrições em breve
              <ArrowIcon />
            </button>
            <button
              className="button button-quiet"
              type="button"
              onClick={() => onNavigate("programacao")}
            >
              Ver programação
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrap">
            <img
              src={photos.blueDoor}
              alt="Detalhe de uma fachada histórica azul no Brasil"
            />
            <span className="photo-credit">Foto: Charles Assunção</span>
          </div>
          <div className="hero-stamp" aria-label="Evento totalmente online">
            <span>100%</span>
            <small>online</small>
          </div>
          <div className="hero-year" aria-hidden="true">
            2026
          </div>
        </div>

        <div className="hero-meta">
          <div>
            <span>Quando</span>
            <strong>Data a definir</strong>
          </div>
          <div>
            <span>Onde</span>
            <strong>Ambiente online</strong>
          </div>
          <div>
            <span>Para quem</span>
            <strong>Pesquisadores, estudantes e profissionais</strong>
          </div>
        </div>
      </section>

      <section className="manifesto section">
        <Eyebrow>Sobre o encontro</Eyebrow>
        <div className="manifesto-grid">
          <h2>
            Preservar também é criar <em>novas relações</em> com o que já
            existe.
          </h2>
          <div className="manifesto-copy">
            <p>
              Em 2026, o ENPAC volta a conectar pessoas dedicadas a investigar,
              conservar e transformar o patrimônio construído.
            </p>
            <p>
              O tema desta edição será anunciado em breve. Até lá, convidamos
              você a acompanhar a construção deste encontro.
            </p>
          </div>
        </div>
      </section>

      <section className="facts section">
        <article>
          <span className="fact-number">01</span>
          <div>
            <h3>Conexão sem fronteiras</h3>
            <p>
              Uma edição 100% online, aberta a encontros de diferentes lugares.
            </p>
          </div>
        </article>
        <article>
          <span className="fact-number">02</span>
          <div>
            <h3>Conhecimento compartilhado</h3>
            <p>
              Conferências, mesas, debates e oficinas em três dias de evento.
            </p>
          </div>
        </article>
        <article>
          <span className="fact-number">03</span>
          <div>
            <h3>Programação em construção</h3>
            <p>Novos nomes, temas e horários serão divulgados em breve.</p>
          </div>
        </article>
      </section>

      <section className="program-preview section">
        <div className="program-preview-header">
          <SectionHeading
            eyebrow="O que esperar"
            title="Três dias para ampliar perspectivas."
          />
          <TextLink onClick={() => onNavigate("programacao")}>
            Ver programação
          </TextLink>
        </div>
        <div className="program-cards">
          {[
            ["01", "Conferências", "Ideias que abrem novas leituras."],
            ["02", "Mesas-redondas", "Diálogos entre pesquisa e prática."],
            ["03", "Oficinas", "Experiências para aprender fazendo."],
          ].map(([number, title, copy]) => (
            <article key={title}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="speaker-preview section">
        <div className="speaker-preview-image">
          <img
            src={photos.street}
            alt="Casario histórico brasileiro com varandas"
          />
          <span className="photo-credit">Foto: Andre Antonelli</span>
        </div>
        <div className="speaker-preview-copy">
          <Eyebrow>Vozes do encontro</Eyebrow>
          <h2>Pessoas que fazem o patrimônio avançar.</h2>
          <p>
            Pesquisadores, profissionais e estudantes se encontram para
            compartilhar experiências e abrir novas perguntas.
          </p>
          <div
            className="placeholder-names"
            aria-label="Palestrantes a confirmar"
          >
            <span>Nome a confirmar</span>
            <span>Nome a confirmar</span>
            <span>Nome a confirmar</span>
          </div>
          <TextLink onClick={() => onNavigate("palestrantes")}>
            Conhecer palestrantes
          </TextLink>
        </div>
      </section>

      <section className="archive-callout section">
        <div>
          <Eyebrow>Nossa trajetória</Eyebrow>
          <h2>Um encontro feito de muitas histórias.</h2>
        </div>
        <div>
          <p>
            Visite as edições anteriores e acompanhe os caminhos que trouxeram o
            ENPAC até aqui.
          </p>
          <TextLink onClick={() => onNavigate("edicoes")}>
            Explorar o arquivo
          </TextLink>
        </div>
      </section>

      <CallToAction interactive />
    </>
  )
}

function CallToAction({ interactive = false }: { interactive?: boolean }) {
  const proximityContainer = useRef<HTMLDivElement>(null)

  return (
    <section className="final-cta">
      <span className="cta-decoration" aria-hidden="true">
        ENPAC
      </span>
      <div ref={proximityContainer}>
        <Eyebrow>ENPAC 2026</Eyebrow>
        <h2>
          {interactive ? (
            <VariableProximity
              label="O próximo encontro começa por aqui."
              containerRef={proximityContainer}
              fromFontVariationSettings="'wght' 500"
              toFontVariationSettings="'wght' 700"
              radius={145}
              falloff="gaussian"
              smoothing={0.2}
            />
          ) : (
            "O próximo encontro começa por aqui."
          )}
        </h2>
        <p>
          As datas e inscrições serão anunciadas em breve. Acompanhe as redes do
          projeto para receber novidades.
        </p>
        <button className="button button-light" type="button">
          Inscrições em breve
          <ArrowIcon />
        </button>
      </div>
    </section>
  )
}

function PageIntro({
  eyebrow,
  title,
  copy,
  aside,
}: {
  eyebrow: string
  title: string
  copy: string
  aside: string
}) {
  return (
    <section className="page-intro">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
      </div>
      <div className="page-intro-copy">
        <p>{copy}</p>
        <span>{aside}</span>
      </div>
    </section>
  )
}

function SpeakersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Vozes do encontro"
        title="Palestrantes"
        copy="O ENPAC aproxima diferentes perspectivas sobre preservação, pesquisa e prática profissional."
        aside="Nomes serão anunciados em breve"
      />

      <section className="speakers-grid section" aria-label="Palestrantes">
        {speakerPlaceholders.map((speaker) => (
          <article className="speaker-card" key={speaker.number}>
            <div className="speaker-image">
              <img src={speaker.image} alt="" />
              <span>{speaker.number}</span>
            </div>
            <div className="speaker-card-copy">
              <h2>Nome do palestrante</h2>
              <p>Instituição · País</p>
              <span>Tema da participação a confirmar</span>
            </div>
          </article>
        ))}
      </section>

      <aside className="announcement section">
        <span>Novos nomes</span>
        <p>
          A programação está em construção. Acompanhe os canais do projeto para
          conhecer as próximas pessoas convidadas.
        </p>
      </aside>
      <CallToAction />
    </>
  )
}

function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(0)

  return (
    <>
      <PageIntro
        eyebrow="Agenda do evento"
        title="Programação"
        copy="Uma programação online pensada para aproximar ideias, experiências e pessoas."
        aside="Programação demonstrativa · sujeita a alterações"
      />

      <section className="schedule-section section">
        <div className="day-tabs" role="tablist" aria-label="Dias do evento">
          {schedule.map((_, index) => (
            <button
              key={index}
              id={`day-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selectedDay === index}
              aria-controls={`day-panel-${index}`}
              tabIndex={selectedDay === index ? 0 : -1}
              className={selectedDay === index ? "is-active" : ""}
              onClick={() => setSelectedDay(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault()
                  const direction = event.key === "ArrowRight" ? 1 : -1
                  const next =
                    (selectedDay + direction + schedule.length) %
                    schedule.length
                  setSelectedDay(next)
                  document.getElementById(`day-tab-${next}`)?.focus()
                }
              }}
            >
              <span>Dia {index + 1}</span>
              <small>Data a definir</small>
            </button>
          ))}
        </div>

        <div
          id={`day-panel-${selectedDay}`}
          role="tabpanel"
          aria-labelledby={`day-tab-${selectedDay}`}
          className="schedule-list"
        >
          {schedule[selectedDay].map((item, index) => (
            <article key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <div className="schedule-item-main">
                <span>{item.type}</span>
                <h2>{item.title}</h2>
                <p>Participantes a confirmar</p>
              </div>
              <button type="button" disabled>
                Transmissão em breve
              </button>
              <span className="schedule-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="schedule-note section">
        <Eyebrow>Importante</Eyebrow>
        <p>
          Horários, atividades e links de transmissão são placeholders para
          visualização do protótipo. A agenda oficial será publicada após a
          confirmação da curadoria.
        </p>
      </section>
      <CallToAction />
    </>
  )
}

function EditionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Memória do ENPAC"
        title="Edições anteriores"
        copy="Cada encontro amplia uma conversa contínua sobre o patrimônio construído e seus futuros possíveis."
        aside="Arquivo em atualização"
      />

      <section className="edition-grid section" aria-label="Edições anteriores">
        {editions.map((edition, index) => (
          <article className="edition-card" key={edition.year}>
            <div className="edition-image">
              <img src={edition.image} alt="" />
              <span>{edition.year}</span>
            </div>
            <div className="edition-copy">
              <div>
                <Eyebrow>Edição {String(index + 1).padStart(2, "0")}</Eyebrow>
                <h2>Tema da edição</h2>
                <p>
                  Conteúdo e informações desta edição serão revisados em breve.
                </p>
              </div>
              {edition.available ? (
                <a
                  className="text-link"
                  href="https://sites.google.com/view/2023enpac"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Visitar edição de 2023</span>
                  <ArrowIcon />
                </a>
              ) : (
                <span className="archive-status">Arquivo em atualização</span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="archive-disclaimer section">
        <span>Nota sobre o arquivo</span>
        <p>
          Os anos e temas apresentados nesta estrutura, com exceção do site de
          2023, são demonstrativos e serão validados antes da publicação.
        </p>
      </section>
      <CallToAction />
    </>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>("inicio")
  const mainRef = useRef<HTMLElement>(null)
  const pageTween = useRef<gsap.core.Tween | null>(null)
  const hasNavigated = useRef(false)

  const navigate = (page: Page) => {
    if (page === activePage) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const main = mainRef.current
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    pageTween.current?.kill()

    if (!main || reducedMotion) {
      hasNavigated.current = true
      setActivePage(page)
      window.scrollTo({ top: 0, behavior: "auto" })
      return
    }

    pageTween.current = gsap.to(main, {
      opacity: 0,
      y: -14,
      duration: 0.18,
      ease: "power1.in",
      onComplete: () => {
        hasNavigated.current = true
        setActivePage(page)
        window.scrollTo({ top: 0, behavior: "auto" })
      },
    })
  }

  useLayoutEffect(() => {
    const main = mainRef.current
    if (!main || !hasNavigated.current) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reducedMotion) {
      gsap.set(main, { clearProps: "opacity,transform" })
      return
    }

    pageTween.current = gsap.fromTo(
      main,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: "power3.out",
        clearProps: "opacity,transform",
      },
    )
  }, [activePage])

  useEffect(
    () => () => {
      pageTween.current?.kill()
    },
    [],
  )

  useEffect(() => {
    document.title =
      activePage === "inicio"
        ? "ENPAC 2026 — Encontro do Patrimônio Construído"
        : `${pages.find((page) => page.id === activePage)?.label} — ENPAC 2026`
  }, [activePage])

  return (
    <div className="site-shell">
      <Header activePage={activePage} onNavigate={navigate} />
      <main id="main-content" ref={mainRef} data-transition="gsap">
        {activePage === "inicio" && <HomePage onNavigate={navigate} />}
        {activePage === "palestrantes" && <SpeakersPage />}
        {activePage === "programacao" && <SchedulePage />}
        {activePage === "edicoes" && <EditionsPage />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  )
}
