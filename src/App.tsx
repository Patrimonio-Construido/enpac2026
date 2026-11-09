import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"

import AnimatedContent from "./components/animations/AnimatedContent"
import StrokeText from "./components/animations/StrokeText"
import ShinyText from "./components/animations/ShinyText"
import VariableProximity from "./components/animations/VariableProximity"
import { availableMemory } from "process"

type Page = "inicio" | "palestrantes" | "programacao" | "edicoes"

type ScheduleItem = {
  time: string
  type: string
  title: string
  participants: string
}

const pages: { id: Page; label: string }[] = [
  { id: "inicio", label: "Página Inicial" },
  { id: "palestrantes", label: "Palestrantes" },
  { id: "programacao", label: "Programação" },
  { id: "edicoes", label: "Edições Anteriores" },
]

const photos = {
  blueDoor: "https://images.unsplash.com/photo-1647869668521-c0486729d0dc?auto=format&fit=crop&w=1400&q=85",
  street: "https://images.unsplash.com/photo-1689936152585-0913f81c62e5?auto=format&fit=crop&w=1400&q=85",
  oldDoor: "https://images.unsplash.com/photo-1626125937207-9b8f176d9f3a?auto=format&fit=crop&w=1200&q=85",
  arch: "https://images.unsplash.com/photo-1668715590722-9b10644387cd?auto=format&fit=crop&w=1400&q=85",
}

type Speaker = {
  id: number
  name: string
  image: string
  lecture: string
  /** Biografia: cada item do array é um parágrafo. Vazio = aviso "em breve". */
  bio: string[]
}

const speakers: Speaker[] = [
  {
    id: 0,
    name: "Karina Roquete",
    image: "/speakers/karina_roquete.png",
    lecture: "Entre a Memória e a Matéria: Manifestações Patológicas e o Desafio de Restaurar para Preservar",
    bio: [
      "Arquitetura e Urbanismo – Concluído em dezembro 2003 - Faculdade de Arquitetura e Urbanismo Itaúna /MG.",
      "Pós-Graduação em Gestão da Construção Civil Pública – Concluído em dezembro de 2009 - Universidade Federal de Minas Gerais – UFMG.",
      "Planejamento Governamental e Gestão Orçamentária e Financeira - Abril 2013 - Tribunal de Contas da União.",
      "Gerenciamento do Canteiro de Obras - abril de 2013 - Meta Consultores Ltda.",
      "Auditoria e Fiscalização de Obras Públicas – promovido pela Controladoria Geral do Estado de Minas Gerais – novembro de 2016.",
      "I Congresso Internacional Gestão dos Patrimônios da Humanidade Urbanos: desafios e riscos da preservação I Simpósio Internacional Patrimônios da Humanidade Mineiros no Contexto Internacional. Palestrante: O tombamento e a unidade de conservação da natureza como instrumentos de gestão do patrimônio mundial: o caso da Serra dos Cristais – Diamantina/MG",
      "Pós-Graduação em Conservação e Gestão do Patrimônio Cultural – Conclusão abril de 2024 - Pontifícia Universidade Católica de Minas Gerais."
    ],
  },
  {
    id: 1,
    name: "Caroline Amormino",
    image: "/speakers/caroline_amormino.png",
    lecture: "Tecnologia Como Subsídio à Tomada de Decisão: O Caso do Museu da Moda de Belo Horizonte",
    bio: [
      "Arquiteta e Urbanista, Especialista em BIM e em Gestão de Projetos (PUC Minas), com trajetória profissional nos setores de indústria, siderurgia e mineração.",
      "Iniciou sua carreira na arquitetura e direcionou sua atuação para a transformação digital, desenvolvendo experiência em implementação e gestão de processos BIM, coordenação de projetos multidisciplinares e atuação como BIM Manager.",
      "Desde 2024, atua como Especialista BIM na Superintendência de Desenvolvimento da Capital (SUDECAP), contribuindo para a implementação e consolidação do BIM na administração pública, na interface entre tecnologia, processos, pessoas e gestão.",
      "Atua em frentes de governança, estruturação de processos, requisitos, gestão da informação, fiscalização e capacitação, além do desenvolvimento e disseminação de documentos e diretrizes BIM.",
      "É também mentora voluntária no programa internacional Women in BIM, contribuindo para o desenvolvimento profissional e o fortalecimento da presença feminina na transformação digital da construção civil."
    ],
  },
  {
    id: 2,
    name: "Rodrigo Figueiredo Reis",
    image: "/speakers/rodrigo_reis.png",
    lecture: "Ciência, Tecnologia e Preservação: IoT e inteligência de dados no patrimônio cultural edificado",
    bio: [
      "Arquiteto e urbanista, doutorando em Inovação Tecnológica pela Universidade Federal de Minas Gerais (UFMG), sob orientação do Prof. Dr. Adriano César Machado Pereira, mestre em Patrimônio Cultural e graduado em Arquitetura e Urbanismo pela Universidade Federal do Rio de Janeiro (UFRJ).",
      "Sua pesquisa investiga a aplicação de Internet das Coisas (IoT) e aprendizado de máquina (machine learning) ao monitoramento do patrimônio cultural edificado, articulando sensores, processamento de borda e análise de dados para apoiar a identificação precoce de alterações e subsidiar decisões de conservação preventiva.",
      "Possui mais de 20 anos de atuação em órgãos de patrimônio cultural, com experiência em projetos, planejamento e gerenciamento de obras de conservação e restauro, além de planejamento estratégico voltado à preservação.",
      "É professor universitário e arquiteto da Prefeitura de Contagem (MG), com trajetória que integra pesquisa, prática profissional e inovação tecnológica aplicada ao patrimônio."
    ],
  },
  {
    id: 3,
    name: "Francielle Ferreira Montanari",
    image: "/speakers/francielle_montanari.png",
    lecture: "Diagnóstico e Mapeamento de Danos em Estruturas de Concreto Armado Modernistas por Ensaios Não Destrutivos: O Caso do Museu de Arte da Pampulha",
    bio: [
      "Arquiteta e Urbanista e Especialista em Conservação e Gestão do Patrimônio Cultural pela PUC Minas, Doutoranda e Mestra pelo Programa de Pós-Graduação em Ambiente Construído e Patrimônio Sustentável da Escola de Arquitetura da Universidade Federal de Minas Gerais (PACPS/UFMG).",
      "Foi pesquisadora bolsista da FAPEMIG, desenvolvendo investigação voltada ao diagnóstico patológico e à restauração de estruturas em concreto armado no patrimônio moderno, tendo como objeto de estudo o Conjunto Arquitetônico da Pampulha.",
      "Integrante do Comitê de Jovens Pesquisadores do ICOMOS Brasil, atuou no ensino superior em estágios de docência na UFMG (Escola de Arquitetura e Escola de Belas Artes) e na pós-graduação de Gestão de Projetos de Patrimônio Cultural da UEMG.",
      "No âmbito profissional, possui experiência no gerenciamento de projetos e obras de restauração do patrimônio cultural, com atuação técnica junto ao IEPHA/MG.",
      "Atualmente, realiza assessoramento técnico ao Ministério Público de Minas Gerais, por meio da Plataforma Semente (CeMAIS/MPMG), no acompanhamento, análise e monitoramento de projetos socioambientais e de preservação do patrimônio cultural."
    ],
  },
  {
    id: 4,
    name: "Ana Regina Mizrahy Cuperschmid",
    image: "/speakers/ana_cuperschmid.png",
    lecture: "HBIM: modelar, simular, diagnosticar e difundir",
    bio: [
      "Professora Associada da Faculdade de Engenharia Civil, Arquitetura e Urbanismo (FECFAU) da UNICAMP, atuando na graduação e pós-graduação da instituição.",
      "Possui pós-doutorado pelo Programa de Pós-Graduação em Arquitetura, Tecnologia e Cidade (PPGATC) da UNICAMP e pelo Programa de Pós-Graduação do Instituto de Arquitetura e Urbanismo (IAU) da USP.",
      "Doutora pelo PPGATC; Mestre em Artes pelo Instituto de Artes (IA), UNICAMP, especialista em Gestão de Projetos e graduada em Arquitetura e Urbanismo pela Universidade Federal de Viçosa (UFV).",
      "Desenvolve pesquisas centradas no uso criativo e colaborativo de tecnologias digitais para arquitetura e construção.",
      "Tem lecionado, conduzido pesquisas e publicado em áreas sobre Building Information Modeling (BIM), Heritage Building Information Modeling (HBIM), Realidade Virtual e Aumentada. Atualmente, atua como vice-chefe do Departamento de Arquitetura e Construção da FECFAU."
    ],
  },
  {
    id: 5,
    name: "Andréa Lanna Mendes Novais",
    image: "/speakers/andrea_novais.png",
    lecture: "Caminhos da Preservação: Experiências, Avanços e os Desafios Contemporâneos",
    bio: [
      "Arquiteta Urbanista , especialista em Urbanismo, especialista em Revitalização Urbana e Arquitetônica.",
      "Analista do Ministério Público de Minas Gerais, atua na Coordenadoria das Promotorias de Patrimonio Cultural e Turístico desde 2008."
    ],
  },
]

const schedule: ScheduleItem[][] = [
  [
    { 
      time: "18:00", 
      type: "Entre a memória e a matéria", 
      title: "Manifestações patológicas e o desafio de restaurar para preservar",
      participants: "Karina Roquete"
    },
    {
      time: "19:00",
      type: "Tecnologia como subsídio à tomada de decisão",
      title: "O caso do Museu da Moda de Belo Horizonte",
      participants: "Caroline Amormino"
    },
  ],
  [
    { 
      time: "18:00", 
      type: "Ciência, tecnologia e preservação", 
      title: "IoT e inteligência de dados no patrimônio cultural edificado",
      participants: "Rodrigo Figueiredo Reis"
    },
    {
      time: "19:00",
      type: "Diagnóstico e Mapeamento de Danos em Estruturas de Concreto Armado Modernistas por Ensaios Não Destrutivos",
      title: "O Caso do Museu de Arte da Pampulha",
      participants: "Francielle Ferreira Montanari"
    },
  ],
  [
    {
      time: "18:00",
      type: "HBIM",
      title: "Modelar, simular, diagnosticar e difundir",
      participants: "Ana Regina Mizrahy Cupershmid"
    },
    {
      time: "19:00",
      type: "Caminhos da preservação",
      title: "Experiências, avanços e os desafios contemporâneos",
      participants: "Andréa Lanna Mendes Novais"
    },
  ],
]

const editions = [
  { 
    year: "2020", 
    image: "/old-editions/edicao1.png",
    available: false,
    theme: "Patologia, Intervenções e Tecnologias"
  },
  { 
    year: "2021", 
    image: "/old-editions/edicao2.png",
    available: true,
    link: "https://sites.google.com/view/2021enpac",
    theme: "Conhecer para Preservar, Preservar para Conhecer"
  },
  { 
    year: "2022", 
    image: "/old-editions/edicao3.png",
    available: true,
    link: "https://sites.google.com/view/enpac2022",
    theme: "Paisagens Cotidianas"
  },
  { 
    year: "2023", 
    image: "/old-editions/edicao4.png",
    available: true,
    link: "https://sites.google.com/view/2023enpac",
    theme: "Tecnologias e Instrumentos de Gerenciamento para Preservação"
  },
  { 
    year: "2024", 
    image: "/old-editions/edicao5.png",
    available: true,
    link: "https://sites.google.com/view/enpac-apt2024",
    theme: "Perspectivas e Reflexões e 1º Congresso APTI LACC: Gestão do Patrimônio Construído"
  },
  {
    year: "2025",
    image: "/old-editions/edicao6.png",
    available: true,
    link: "https://sites.google.com/view/enpac2025",
    theme: "Conservação, Recuperação e Reforço Estrutural"
  }
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

function Brand({ animated = false }: { animated?: boolean }) {
  if (!animated) {
    return (
      <span className="brand" aria-label="ENPAC 2026">
        <span className="brand-name">ENPAC</span>
        <span className="brand-year">2026</span>
      </span>
    )
  }

  return (
    <span
      className="brand stroke-text"
      role="img"
      aria-label="ENPAC 2026"
      data-trigger="mount"
    >
      <StrokeText
        className="brand-name"
        text="ENPAC"
        strokeWidth={0.75}
      />
      <StrokeText
        className="brand-year"
        text="2026"
        strokeWidth={0.45}
        delay={0.1}
      />
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
  const navigationRef = useRef<HTMLElement>(null)
  const menuTimeline = useRef<gsap.core.Timeline | null>(null)
  const menuInitialized = useRef(false)

  useLayoutEffect(() => {
    const navigation = navigationRef.current
    if (!navigation) return

    const mobile = window.matchMedia("(max-width: 1080px)")
    const items = navigation.querySelectorAll(
      ".nav-links button, .button-peach",
    )

    const animate = () => {
      menuTimeline.current?.kill()
      gsap.killTweensOf([navigation, ...items])

      if (!mobile.matches) {
        gsap.set([navigation, ...items], { clearProps: "all" })
        return
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
      if (reducedMotion) {
        gsap.set(navigation, {
          autoAlpha: menuOpen ? 1 : 0,
          y: 0,
          display: menuOpen ? "flex" : "none",
          pointerEvents: menuOpen ? "auto" : "none",
        })
        gsap.set(items, { clearProps: "opacity,transform" })
        menuInitialized.current = true
        return
      }

      if (!menuInitialized.current && !menuOpen) {
        gsap.set(navigation, {
          autoAlpha: 0,
          y: -12,
          display: "none",
          pointerEvents: "none",
        })
        menuInitialized.current = true
        return
      }

      if (menuOpen) {
        gsap.set(navigation, {
          display: "flex",
          visibility: "visible",
          pointerEvents: "auto",
        })
        menuTimeline.current = gsap
          .timeline()
          .fromTo(
            navigation,
            { opacity: 0, y: -12 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" },
          )
          .fromTo(
            items,
            { opacity: 0, y: -8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.24,
              stagger: 0.045,
              ease: "power2.out",
            },
            "-=0.16",
          )
      } else {
        menuTimeline.current = gsap
          .timeline({
            onComplete: () => {
              gsap.set(navigation, {
                display: "none",
                pointerEvents: "none",
              })
            },
          })
          .to(items, {
            opacity: 0,
            y: -5,
            duration: 0.12,
            stagger: 0.02,
            ease: "power1.in",
          })
          .to(
            navigation,
            { autoAlpha: 0, y: -12, duration: 0.18, ease: "power1.in" },
            "-=0.08",
          )
      }

      menuInitialized.current = true
    }

    animate()
    mobile.addEventListener("change", animate)

    return () => {
      mobile.removeEventListener("change", animate)
      menuTimeline.current?.kill()
    }
  }, [menuOpen])

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
          <Brand animated />
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
          ref={navigationRef}
          id="main-navigation"
          className={`main-navigation ${menuOpen ? "is-open" : ""}`}
          aria-label="Navegação principal"
          data-mobile-animation="gsap"
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
          <img src="/brand/ufmg.png" alt="UFMG" />
          <img src="/brand/puc-minas.png" alt="PUC Minas" />
          <img src="/brand/projeto-patrimonio-construido.png" alt="Projeto Patrimônio Construído" />
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
            <strong>24 a 26/11</strong>
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

      <AnimatedContent className="program-preview section">
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
      </AnimatedContent>

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
            <span>Karina Roquete</span>
            <span>Caroline Amormino</span>
            <span>Rodrigo Figueiredo Reis</span>
            <span>Francielle Ferreira Montanari</span>
            <span>Ana Regina Mizrahy Cuperschmid</span>
            <span>Andréa Lanna Mendes Novais</span>
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
        <h2>O próximo encontro começa por aqui.</h2>
        <p>
          As inscrições serão anunciadas em breve. Acompanhe as redes do
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
}: {
  eyebrow: string
  title: string
  copy: string
}) {
  return (
    <section className="page-intro">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
      </div>
      <div className="page-intro-copy">
        <p>{copy}</p>
      </div>
    </section>
  )
}

function SpeakerBioModal({
  speaker,
  onClose,
}: {
  speaker: Speaker
  onClose: () => void
}) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButton.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      opener?.focus()
    }
  }, [onClose])

  return (
    <div className="bio-overlay" onClick={onClose}>
      <div
        className="bio-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bio-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButton}
          className="bio-close"
          type="button"
          aria-label="Fechar biografia"
          onClick={onClose}
        >
          ×
        </button>
        <div className="bio-image">
          <img src={speaker.image} alt={`Retrato de ${speaker.name}`} />
        </div>
        <div className="bio-content">
          <Eyebrow>Biografia</Eyebrow>
          <h2 id="bio-title">{speaker.name}</h2>
          <p className="bio-lecture">{speaker.lecture}</p>
          <div className="bio-text">
            {speaker.bio.length > 0 ? (
              speaker.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>A biografia completa será publicada em breve.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpeakersPage() {
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null)
  const closeBio = useCallback(() => setActiveSpeaker(null), [])

  return (
    <>
      <PageIntro
        eyebrow="Vozes do encontro"
        title="Palestrantes"
        copy="O ENPAC aproxima diferentes perspectivas sobre preservação, pesquisa e prática profissional."
      />

      <section className="speakers-grid section" aria-label="Palestrantes">
        {speakers.map((speaker) => (
          <article className="speaker-card" key={speaker.id}>
            <div className="speaker-image">
              <img src={speaker.image} alt="" />
            </div>
            <div className="speaker-card-copy">
              <h2>{speaker.name}</h2>
              <span>{speaker.lecture}</span>
              <button
                className="text-link speaker-bio-button"
                type="button"
                aria-haspopup="dialog"
                onClick={() => setActiveSpeaker(speaker)}
              >
                Ler biografia
                <ArrowIcon />
              </button>
            </div>
          </article>
        ))}
      </section>

      {activeSpeaker && (
        <SpeakerBioModal
          speaker={activeSpeaker}
          onClose={closeBio}
        />
      )}
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
              <span>Dia {index + 1} - {index + 24}/11</span>
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
                <p>{item.participants}</p>
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
                <Eyebrow>{String(index + 1)}ª Edição</Eyebrow>
                <h2>{edition.theme}</h2>
                <p>
                  Conteúdo e informações desta edição serão revisados em breve.
                </p>
              </div>
              {edition.available ? (
                <a
                  className="text-link"
                  href={edition.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Visitar edição de {edition.year}</span>
                  <ArrowIcon />
                </a>
              ) : (
                <span className="archive-status">Site não disponível</span>
              )}
            </div>
          </article>
        ))}
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
