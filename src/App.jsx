import { useState } from 'react';
import {
  Award,
  BatteryLow,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flower2,
  HeartPulse,
  LockKeyhole,
  Menu,
  Music,
  PackageCheck,
  Radio,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';

const telegramUrl = 'https://t.me/Kiryusbot';

const navItems = [
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Como funciona', href: '#tecnologia' },
  { label: 'Incluye', href: '#incluye' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'FAQ', href: '#faq' },
];

const heroBenefits = [
  {
    icon: Brain,
    title: 'Protege tu mente',
    copy: 'Reduce la exposicion a campos electromagneticos ambientales.',
  },
  {
    icon: HeartPulse,
    title: 'Cuida tu corazon',
    copy: 'Favorece la coherencia cardiaca y el equilibrio del sistema nervioso.',
  },
  {
    icon: Flower2,
    title: 'Mejora tu bienestar',
    copy: 'Disminuye el estres, la fatiga mental y la sobrecarga sensorial.',
  },
  {
    icon: Radio,
    title: 'Eleva tu frecuencia',
    copy: 'Disenado para acompanarte en meditacion, trabajo profundo y descanso.',
  },
];

const overloadItems = [
  {
    icon: Smartphone,
    title: 'Sobreexposicion digital',
    copy: 'Pantallas, Wi-Fi, 5G, Bluetooth y notificaciones sin pausa.',
  },
  {
    icon: Brain,
    title: 'Mente saturada',
    copy: 'Ansiedad, ruido mental, poca claridad y agotamiento.',
  },
  {
    icon: BatteryLow,
    title: 'Energia drenada',
    copy: 'Cuesta concentrarte, descansar y conectar contigo.',
  },
];

const newStateItems = [
  {
    icon: Sparkles,
    title: 'Mas enfoque',
    copy: 'Claridad mental para tomar mejores decisiones.',
  },
  {
    icon: Flower2,
    title: 'Calma interior',
    copy: 'Regula tu sistema nervioso y reduce la sobrecarga.',
  },
  {
    icon: Brain,
    title: 'Bienestar neuroambiental',
    copy: 'Proteccion y equilibrio en tu entorno digital.',
  },
  {
    icon: HeartPulse,
    title: 'Coherencia mente-corazon',
    copy: 'Armonia, energia y presencia durante el dia.',
  },
];

const techFeatures = [
  ['Algodon organico', 'Suavidad y confort para tu piel.'],
  ['Tela conductiva de plata y cobre', 'Apantallamiento electromagnetico.'],
  ['Carbono activado', 'Disipacion y equilibrio energetico.'],
  ['Bolsillo interno para shungita', 'Armonia y proteccion natural.'],
];

const kitItems = [
  {
    icon: Brain,
    title: 'Kiryus BioShield',
    copy: 'Edicion Founder limitada y numerada.',
  },
  {
    icon: Music,
    title: 'Audio Neurofocus Premium',
    copy: 'Meditaciones y frecuencias exclusivas.',
  },
  {
    icon: BookOpenCheck,
    title: 'Metodo Coherencia Kiryus',
    copy: 'Guia digital para alinear mente y corazon.',
  },
  {
    icon: UsersRound,
    title: 'Acceso comunidad VIP',
    copy: 'Grupo exclusivo de fundadores.',
  },
  {
    icon: Award,
    title: 'Certificado Founder Edition',
    copy: 'Tu numero de fundador y certificado digital.',
  },
];

const testimonials = [
  {
    name: 'Maria E.',
    role: 'Neurocoach',
    initials: 'ME',
    copy: 'Desde que uso Kiryus BioShield siento mi mente mas clara y mi energia mas estable. Lo uso para meditar, trabajar y hasta para dormir.',
  },
  {
    name: 'Andres R.',
    role: 'Emprendedor',
    initials: 'AR',
    copy: 'Me ayuda a desconectarme del ruido digital. Duermo mejor y estoy mas enfocado durante el dia.',
  },
  {
    name: 'Sofia L.',
    role: 'Terapeuta holistica',
    initials: 'SL',
    copy: 'Es parte de mi ritual diario. Siento un cambio real en mi coherencia y en mi bienestar general.',
  },
];

const faqs = [
  {
    question: 'Cuando recibire mi Kiryus BioShield?',
    answer: 'Las entregas comienzan 25 a 40 dias despues del cierre de preventa.',
  },
  {
    question: 'Es comodo para uso diario?',
    answer: 'Si. Esta disenado con materiales premium, livianos y transpirables.',
  },
  {
    question: 'Como se lava?',
    answer: 'Lavado a mano con agua fria y jabon neutro. Secar a la sombra.',
  },
  {
    question: 'Tiene garantia?',
    answer: 'Si, garantia de 30 dias por defectos de fabricacion.',
  },
];

function Brand({ compact = false }) {
  return (
    <a className="brand" href="#inicio" aria-label="Kiryus BioShield inicio">
      <img src="/assets/kiryus-logo.png" alt="Logo Kiryus" />
      {!compact && (
        <span>
          <strong>KIRYUS</strong>
          <small>BIOTECH WELLNESS</small>
        </span>
      )}
    </a>
  );
}

function CtaButton({ children, className = '', size = 'default' }) {
  return (
    <a
      className={`cta-button ${size === 'large' ? 'cta-button--large' : ''} ${className}`}
      href={telegramUrl}
      target="_blank"
      rel="noreferrer"
    >
      <Send size={size === 'large' ? 24 : 18} strokeWidth={2.2} />
      <span>{children}</span>
    </a>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegacion principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="reserve-link" href={telegramUrl} target="_blank" rel="noreferrer">
            Reservar mi unidad
            <small>Edicion limitada</small>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-section" id="inicio">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Nueva generacion de bienestar neuroambiental</p>
          <h1>
            <span>Kiryus</span>
            <strong>BioShield</strong>
          </h1>
          <p className="hero-lead">Protege tu energia. Enfoca tu mente. Eleva tu frecuencia.</p>
          <p className="hero-body">
            Disenado para ayudarte a reducir la sobreestimulacion digital, mejorar tu enfoque y crear
            un estado de coherencia mente-cuerpo.
          </p>
          <CtaButton size="large">Contactanos por Telegram</CtaButton>
          <p className="secure-note">
            <LockKeyhole size={14} />
            Compra 100% segura
          </p>
        </div>

        <div className="hero-visual" aria-label="Mujer usando Kiryus BioShield">
          <img src="/assets/hero-wellness.jpg" alt="Persona usando Kiryus BioShield" />
          <div className="frequency-rings" aria-hidden="true" />
          <Brand compact />
        </div>

        <div className="hero-benefits" aria-label="Beneficios principales">
          {heroBenefits.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="icon-row">
                <Icon aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StateCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="state-card">
      <Icon aria-hidden="true" />
      <h3>{item.title}</h3>
      <p>{item.copy}</p>
    </article>
  );
}

function MindShift() {
  return (
    <section className="mind-section" id="beneficios">
      <div className="container mind-grid">
        <div className="mind-group">
          <h2>Tu mente realmente descansa?</h2>
          <div className="state-list state-list--three">
            {overloadItems.map((item) => (
              <StateCard key={item.title} item={item} />
            ))}
          </div>
        </div>
        <div className="shift-arrow" aria-hidden="true">
          <Zap />
        </div>
        <div className="mind-group">
          <h2>Imagina entrar en un nuevo estado mental</h2>
          <div className="state-list">
            {newStateItems.map((item) => (
              <StateCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section className="technology-section" id="tecnologia">
      <div className="container technology-grid">
        <div className="product-showcase">
          <img src="/assets/bioshield-layers.jpg" alt="Capas internas de Kiryus BioShield" />
          <div className="badge">
            Tecnologia
            <strong>Neuroambiental</strong>
            Avanzada
            <span>*****</span>
          </div>
        </div>

        <div className="tech-copy">
          <p className="eyebrow">Tecnologia que</p>
          <h2>Protege tu mundo</h2>
          <p>
            Kiryus BioShield combina materiales avanzados de apantallamiento electromagnetico con
            diseno ergonomico y coherencia neuroenergetica para ayudarte a vivir con mas claridad,
            calma y coherencia.
          </p>
          <ul className="feature-list">
            {techFeatures.map(([title, copy]) => (
              <li key={title}>
                <CheckCircle2 aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  {copy}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="kit-panel" id="incluye">
          <h2>Incluye tu kit fundador</h2>
          <div className="kit-list">
            {kitItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="kit-item">
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="price-panel" aria-label="Precio fundador">
          <div className="price-top">
            <span>Edicion</span>
            <strong>Founder</strong>
            <p>Solo 100 unidades en el mundo</p>
          </div>
          <img src="/assets/founder-kit.jpg" alt="Kit fundador Kiryus BioShield" />
          <div className="price-copy">
            <span className="future-price">Precio futuro <s>$147.000</s></span>
            <span>Precio Fundador</span>
            <strong>$97.000</strong>
          </div>
          <CtaButton className="price-cta">Primeras 30 unidades $79.000</CtaButton>
          <p className="shipping">
            <PackageCheck size={15} />
            Envio gratis a todo el pais
          </p>
        </aside>
      </div>
    </section>
  );
}

function UrgencyBand() {
  return (
    <section className="urgency-band" aria-label="Disponibilidad limitada">
      <div className="container urgency-grid">
        <div className="urgency-item">
          <UsersRound aria-hidden="true" />
          <p>
            Unete a los primeros
            <strong>100 fundadores</strong>
          </p>
        </div>
        <div className="stock-counter">
          <span>Esta edicion no volvera a estar disponible</span>
          <strong>
            <b>7</b>
            <b>1</b>
          </strong>
          <p>Unidades disponibles</p>
        </div>
        <div className="urgency-item urgency-item--right">
          <Clock3 aria-hidden="true" />
          <p>
            Cierre de preventa en
            <strong>07 dias / 14 horas / 23 min</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonios">
      <div className="container">
        <h2>Lo que dicen nuestros beta testers</h2>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="avatar" aria-hidden="true">
                {item.initials}
              </div>
              <div className="testimonial-body">
                <div className="stars" aria-label="5 estrellas">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p>{item.copy}</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="carousel-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <h2>Preguntas frecuentes</h2>
        <div className="faq-grid">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span>{item.question}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                <p>{item.answer}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FooterCta() {
  return (
    <footer className="footer-cta">
      <div className="container footer-grid">
        <div className="footer-benefits">
          <p>
            <ShieldCheck size={17} />
            Protege tu energia
          </p>
          <p>
            <Brain size={17} />
            Enfoca tu mente
          </p>
          <p>
            <Zap size={17} />
            Eleva tu frecuencia
          </p>
          <strong>Esta es tu era. Vive en coherencia.</strong>
        </div>
        <div className="footer-action">
          <CtaButton size="large">Reservar por Telegram</CtaButton>
          <p>
            <LockKeyhole size={14} />
            Pago 100% seguro
          </p>
        </div>
        <Brand />
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <MindShift />
        <Technology />
        <UrgencyBand />
        <Testimonials />
        <FAQ />
      </main>
      <FooterCta />
    </>
  );
}
