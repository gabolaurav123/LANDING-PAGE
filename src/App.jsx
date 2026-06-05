import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  BatteryLow,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Flower2,
  HeartPulse,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Menu,
  Music,
  PackageCheck,
  Radio,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import { createPayment, fetchFounderAccess, fetchPaymentStatus } from './api.js';
import { useAvailability } from './useAvailability.js';

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
    question: '¿Cuándo recibiré mi Kiryus BioShield?',
    answer: 'Las entregas comienzan 25 a 40 días después del cierre de preventa.',
  },
  {
    question: '¿Es cómodo para uso diario?',
    answer: 'Sí. Está diseñado con materiales premium, livianos y transpirables.',
  },
  {
    question: '¿Cómo se lava?',
    answer: 'Lavado a mano con agua fría y jabón neutro. Secar a la sombra.',
  },
  {
    question: '¿Tiene garantía?',
    answer: 'Sí, garantía de 30 días por defectos de fabricación.',
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

function CtaButton({
  children,
  className = '',
  disabled = false,
  onClick,
  size = 'default',
}) {
  return (
    <button
      type="button"
      className={`cta-button ${size === 'large' ? 'cta-button--large' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      <CreditCard size={size === 'large' ? 24 : 18} strokeWidth={2.2} />
      <span>{children}</span>
    </button>
  );
}

function Header({ onCheckout, soldOut }) {
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
          <button
            className="reserve-link"
            type="button"
            disabled={soldOut}
            onClick={onCheckout}
          >
            {soldOut ? 'Agotado' : 'Reservar mi unidad'}
            <small>Edicion limitada</small>
          </button>
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

function Hero({ onCheckout, soldOut }) {
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
          <CtaButton disabled={soldOut} onClick={onCheckout} size="large">
            {soldOut ? 'Actualmente agotado' : 'Reservar mi unidad'}
          </CtaButton>
          <p className="secure-note">
            <LockKeyhole size={14} />
            Compra 100% segura
          </p>
        </div>

        <div className="hero-visual" aria-label="Mujer usando Kiryus BioShield">
          <img src="/assets/hero-wellness.png" alt="Persona usando Kiryus BioShield" />
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

function Technology({ counter, onCheckout, soldOut }) {
  return (
    <section className="technology-section" id="tecnologia">
      <div className="container technology-grid">
        <div className="product-showcase">
          <img src="/assets/bioshield-layers.png" alt="Capas internas de Kiryus BioShield" />
          <div className="badge">
            <strong>
              <span>Tecnología</span>
              <span>Neuroambiental</span>
              <span>Avanzada</span>
            </strong>
            <span className="badge-stars">*****</span>
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
            <p>
              {counter
                ? `Solo ${counter.totalQuantity} unidades en el mundo`
                : 'Oferta limitada'}
            </p>
          </div>
          <img src="/assets/founder-kit.png" alt="Kit fundador Kiryus BioShield" />
          <div className="price-copy">
            <span className="future-price">Precio futuro <s>$147</s></span>
            <span>Precio Fundador</span>
            <strong>$97</strong>
          </div>
          <CtaButton className="price-cta" disabled={soldOut} onClick={onCheckout}>
            {soldOut ? 'Sin unidades disponibles' : 'Primeras 30 unidades 79 dólares'}
          </CtaButton>
          <p className="shipping">
            <PackageCheck size={15} />
            Envio gratis a todo el pais
          </p>
        </aside>
      </div>
    </section>
  );
}

function AvailabilityCounter({ counter, error, loading }) {
  if (loading && !counter) {
    return (
      <div className="stock-counter stock-counter--status" aria-live="polite">
        <LoaderCircle className="is-spinning" aria-hidden="true" />
        <p>Consultando disponibilidad</p>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="stock-counter stock-counter--status" aria-live="polite">
        <AlertCircle aria-hidden="true" />
        <p>{error || 'Disponibilidad temporalmente no disponible'}</p>
      </div>
    );
  }

  const progress = counter.totalQuantity
    ? Math.min(100, Math.round((counter.soldCount / counter.totalQuantity) * 100))
    : 100;
  const digits = String(counter.remainingCount).split('');

  return (
    <div className="stock-counter" aria-live="polite">
      <span>Oferta limitada</span>
      <strong aria-label={`${counter.remainingCount} unidades disponibles`}>
        {digits.map((digit, index) => (
          <b key={`${digit}-${index}`}>{digit}</b>
        ))}
      </strong>
      <p>Unidades disponibles</p>
      <div
        className="availability-progress"
        aria-label={`${counter.soldCount} vendidos de ${counter.totalQuantity}`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <small>
        Vendidos: {counter.soldCount} / Total: {counter.totalQuantity}
      </small>
    </div>
  );
}

function UrgencyBand({ availability }) {
  const { counter } = availability;

  return (
    <section className="urgency-band" aria-label="Disponibilidad limitada">
      <div className="container urgency-grid">
        <div className="urgency-item">
          <UsersRound aria-hidden="true" />
          <p>
            Unete a los primeros
            <strong>
              {counter ? `${counter.totalQuantity} fundadores` : 'Edicion limitada'}
            </strong>
          </p>
        </div>
        <AvailabilityCounter {...availability} />
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
  const [openItems, setOpenItems] = useState(() => faqs.map((_, index) => index));

  const toggleFaq = (index) => {
    setOpenItems((items) =>
      items.includes(index) ? items.filter((item) => item !== index) : [...items, index],
    );
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <h2>Preguntas frecuentes</h2>
        <div className="faq-grid">
          {faqs.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleFaq(index)}
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

function FooterCta({ onCheckout, soldOut }) {
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
          <CtaButton disabled={soldOut} onClick={onCheckout} size="large">
            {soldOut ? 'Actualmente agotado' : 'Reservar y pagar'}
          </CtaButton>
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

function CheckoutModal({ availability, onClose, open }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, open, submitting]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setSubmitting(true);

    try {
      const latestCounter = await availability.refresh();

      if (!latestCounter) {
        setError('No pudimos verificar la disponibilidad. Inténtalo nuevamente.');
        return;
      }

      if (latestCounter.remainingCount <= 0) {
        setError('Actualmente no hay cupos disponibles.');
        return;
      }

      const payment = await createPayment({ email, name });
      localStorage.setItem('paymentId', payment.paymentId);
      window.location.assign(payment.url);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  const soldOut = availability.counter?.remainingCount <= 0;

  return (
    <div
      className="checkout-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        aria-labelledby="checkout-title"
        aria-modal="true"
        className="checkout-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar formulario de pago"
          className="checkout-close"
          disabled={submitting}
          type="button"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="checkout-heading">
          <img src="/assets/kiryus-logo.png" alt="" />
          <div>
            <span>Edición Founder</span>
            <h2 id="checkout-title">Reserva tu Kiryus BioShield</h2>
          </div>
        </div>

        <p className="checkout-intro">
          Completa tus datos. Crearemos tu reserva y te enviaremos al pago seguro de Stripe.
        </p>

        {availability.counter && (
          <div className="checkout-availability">
            <strong>{availability.counter.remainingCount}</strong>
            <span>unidades disponibles de {availability.counter.totalQuantity}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <span className="input-shell">
              <UserRound size={18} aria-hidden="true" />
              <input
                autoComplete="name"
                maxLength={120}
                name="name"
                placeholder="Tu nombre"
                required
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </span>
          </label>
          <label>
            Correo electrónico
            <span className="input-shell">
              <Mail size={18} aria-hidden="true" />
              <input
                autoComplete="email"
                maxLength={320}
                name="email"
                placeholder="correo@ejemplo.com"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>

          {error && (
            <p className="form-error" role="alert">
              <AlertCircle size={17} aria-hidden="true" />
              {error}
            </p>
          )}

          <button className="checkout-submit" disabled={submitting || soldOut} type="submit">
            {submitting ? (
              <LoaderCircle className="is-spinning" size={20} aria-hidden="true" />
            ) : (
              <CreditCard size={20} aria-hidden="true" />
            )}
            {soldOut
              ? 'Actualmente no hay cupos'
              : submitting
                ? 'Preparando pago seguro'
                : 'Continuar a pago seguro'}
          </button>
        </form>

        <div className="checkout-trust">
          <span>
            <LockKeyhole size={15} aria-hidden="true" />
            Pago procesado por Stripe
          </span>
          <a href={telegramUrl} rel="noreferrer" target="_blank">
            <Send size={15} aria-hidden="true" />
            Soporte por Telegram
          </a>
        </div>
      </section>
    </div>
  );
}

function FounderAccessPanel({ access, error }) {
  const accessPending = !access && !error;
  const telegramAccessUrl = access?.telegramUrl || telegramUrl;

  return (
    <section className="founder-access" aria-labelledby="founder-access-title">
      <p className="eyebrow">Contenido Founder</p>
      <h2 id="founder-access-title">Tu kit digital está listo</h2>
      <p>
        Accede a la guía digital para alinear mente y corazón, los audios Neurofocus y el bot de
        Telegram para continuar tu proceso.
      </p>

      <div className="founder-access-grid">
        <article>
          <BookOpenCheck aria-hidden="true" />
          <div>
            <h3>Guía digital</h3>
            <p>Método Coherencia Kiryus para alinear mente y corazón.</p>
          </div>
        </article>
        <article>
          <Music aria-hidden="true" />
          <div>
            <h3>Audios Neurofocus</h3>
            <p>Meditaciones y frecuencias para enfoque, calma y descanso.</p>
          </div>
        </article>
      </div>

      {accessPending && (
        <p className="founder-access-status">
          <LoaderCircle className="is-spinning" size={17} aria-hidden="true" />
          Preparando tus enlaces privados...
        </p>
      )}

      {error && (
        <p className="founder-access-status founder-access-status--error">
          <AlertCircle size={17} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="founder-access-actions">
        {access?.contentConfigured ? (
          <a className="founder-access-button" href={access.contentUrl} rel="noreferrer" target="_blank">
            <BookOpenCheck size={18} aria-hidden="true" />
            Descargar guía y audios
          </a>
        ) : (
          <span className="founder-access-button is-disabled">
            <BookOpenCheck size={18} aria-hidden="true" />
            Material digital pendiente
          </span>
        )}
        <a className="founder-access-button founder-access-button--outline" href={telegramAccessUrl} rel="noreferrer" target="_blank">
          <Send size={18} aria-hidden="true" />
          Escribir al bot de Telegram
        </a>
      </div>
    </section>
  );
}

function SuccessPage() {
  const availability = useAvailability();
  const [founderAccess, setFounderAccess] = useState(null);
  const [founderAccessError, setFounderAccessError] = useState('');
  const [payment, setPayment] = useState(null);
  const [phase, setPhase] = useState('checking');
  const [paymentId] = useState(() => {
    const queryId = new URLSearchParams(window.location.search).get('paymentId');
    return queryId || localStorage.getItem('paymentId') || '';
  });

  useEffect(() => {
    if (!paymentId) {
      setPhase('missing');
      return undefined;
    }

    let active = true;
    let timer;
    const startedAt = Date.now();

    const checkPayment = async () => {
      try {
        const nextPayment = await fetchPaymentStatus(paymentId);
        if (!active) return;

        setPayment(nextPayment);

        if (nextPayment.status === 'paid') {
          setPhase('paid');
          availability.refresh();
          try {
            const access = await fetchFounderAccess(paymentId);
            if (!active) return;
            setFounderAccess(access);
            setFounderAccessError('');
          } catch {
            if (!active) return;
            setFounderAccessError('No pudimos cargar tus enlaces privados en este momento.');
          }
          return;
        }

        const timedOut = Date.now() - startedAt >= 60_000;
        setPhase(timedOut ? 'pending-timeout' : 'pending');

        if (!timedOut) {
          timer = window.setTimeout(checkPayment, 4_000);
        }
      } catch (requestError) {
        if (!active) return;
        setPhase(requestError.status === 404 ? 'not-found' : 'error');
      }
    };

    checkPayment();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [availability.refresh, paymentId]);

  const statusContent = {
    checking: {
      icon: <LoaderCircle className="is-spinning" aria-hidden="true" />,
      title: 'Verificando pago...',
      copy: 'Estamos esperando la confirmación segura de Stripe.',
    },
    pending: {
      icon: <Clock3 aria-hidden="true" />,
      title: 'Verificando pago...',
      copy: 'Tu pago todavía está pendiente. Esta página se actualizará automáticamente.',
    },
    'pending-timeout': {
      icon: <Clock3 aria-hidden="true" />,
      title: 'Aún no se confirmó el pago',
      copy: 'La confirmación puede tardar unos minutos. Puedes volver a consultar más tarde.',
    },
    paid: {
      icon: <CheckCircle2 aria-hidden="true" />,
      title: 'Pago confirmado correctamente',
      copy: 'Tu unidad Founder quedó registrada. Te contactaremos con los siguientes pasos.',
    },
    missing: {
      icon: <AlertCircle aria-hidden="true" />,
      title: 'No encontramos una reserva reciente',
      copy: 'Inicia el pago desde la landing para poder verificar tu reserva.',
    },
    'not-found': {
      icon: <AlertCircle aria-hidden="true" />,
      title: 'Pago no encontrado',
      copy: 'No pudimos localizar esta reserva. Contacta soporte si realizaste el pago.',
    },
    error: {
      icon: <AlertCircle aria-hidden="true" />,
      title: 'No pudimos verificar el pago',
      copy: 'Inténtalo nuevamente en unos minutos o contacta soporte.',
    },
  }[phase];

  return (
    <main className="success-page">
      <section className={`success-panel success-panel--${phase}`}>
        <Brand />
        <div className="success-status-icon">{statusContent.icon}</div>
        <p className="eyebrow">Estado de tu reserva</p>
        <h1>{statusContent.title}</h1>
        <p>{statusContent.copy}</p>

        {payment && (
          <dl className="payment-summary">
            <div>
              <dt>Nombre</dt>
              <dd>{payment.name || 'No informado'}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{payment.email}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{payment.status === 'paid' ? 'Pagado' : 'Pendiente'}</dd>
            </div>
          </dl>
        )}

        {phase === 'paid' && availability.counter && (
          <p className="success-counter">
            Disponibles: <strong>{availability.counter.remainingCount}</strong> · Vendidos:{' '}
            <strong>{availability.counter.soldCount}</strong>
          </p>
        )}

        {phase === 'paid' && (
          <FounderAccessPanel access={founderAccess} error={founderAccessError} />
        )}

        <div className="success-actions">
          <a className="cta-button" href="/">
            Volver a la landing
          </a>
          <a className="support-link" href={telegramUrl} rel="noreferrer" target="_blank">
            <Send size={17} aria-hidden="true" />
            Soporte por Telegram
          </a>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const isSuccessPage = window.location.pathname.replace(/\/+$/, '') === '/success';
  const availability = useAvailability({ enabled: !isSuccessPage });
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (isSuccessPage) {
    return <SuccessPage />;
  }

  const soldOut = availability.counter?.remainingCount <= 0;

  return (
    <>
      <Header onCheckout={() => setCheckoutOpen(true)} soldOut={soldOut} />
      <main>
        <Hero onCheckout={() => setCheckoutOpen(true)} soldOut={soldOut} />
        <MindShift />
        <Technology
          counter={availability.counter}
          onCheckout={() => setCheckoutOpen(true)}
          soldOut={soldOut}
        />
        <UrgencyBand availability={availability} />
        <Testimonials />
        <FAQ />
      </main>
      <FooterCta onCheckout={() => setCheckoutOpen(true)} soldOut={soldOut} />
      <CheckoutModal
        availability={availability}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
