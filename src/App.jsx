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
  Copy,
  CreditCard,
  Flower2,
  HeartPulse,
  Home,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Music,
  NotebookPen,
  PackageCheck,
  Phone,
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
import { claimPremiumCode, createPayment, fetchPaymentStatus, trackEvent } from './api.js';
import { useAvailability } from './useAvailability.js';

const PRODUCT_NAME = 'BioShield by KIRYUS™';
const telegramUrl = import.meta.env.VITE_TELEGRAM_BOT_URL || 'https://t.me/Kiryusbot';
const SHIPPING_FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzX0AR_nijmihCfUawqWcc5URHdMZwHpkV8IqUDXVmeN6q7rlQbLXmJGYBpLoDgdt9/exec';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyShippingForm = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postalCode: '',
  addressReference: '',
  notes: '',
};

function normalizeShippingForm(form) {
  return {
    fullName: form.fullName.trim().replace(/\s+/g, ' '),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim().replace(/\s+/g, ' '),
    country: form.country.trim().replace(/\s+/g, ' '),
    city: form.city.trim().replace(/\s+/g, ' '),
    address: form.address.trim().replace(/\s+/g, ' '),
    postalCode: form.postalCode.trim().replace(/\s+/g, ' '),
    addressReference: form.addressReference.trim().replace(/\s+/g, ' '),
    notes: form.notes.trim().replace(/\s+/g, ' '),
  };
}

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
    title: 'Pensado para enfoque',
    copy: 'Acompaña tus momentos de pausa, trabajo profundo y presencia diaria.',
  },
  {
    icon: HeartPulse,
    title: 'Rituales de calma',
    copy: 'Diseñado para integrarse en hábitos de respiración, descanso y regulación.',
  },
  {
    icon: Flower2,
    title: 'Experiencia premium',
    copy: 'Textiles seleccionados, diseño cómodo y acceso digital posterior a la compra.',
  },
  {
    icon: MessageCircle,
    title: 'Acceso por Telegram',
    copy: 'Recibe un código premium para activar contenido dentro del bot oficial.',
  },
];

const overloadItems = [
  {
    icon: Smartphone,
    title: 'Ruido digital',
    copy: 'Pantallas, mensajes, tareas abiertas y notificaciones constantes.',
  },
  {
    icon: Brain,
    title: 'Mente saturada',
    copy: 'Días con poca claridad, cansancio mental y atención fragmentada.',
  },
  {
    icon: BatteryLow,
    title: 'Hábitos dispersos',
    copy: 'Cuesta pausar, respirar, volver al cuerpo y sostener una rutina.',
  },
];

const newStateItems = [
  {
    icon: Sparkles,
    title: 'Más enfoque',
    copy: 'Un recordatorio físico para volver a lo importante durante el día.',
  },
  {
    icon: Flower2,
    title: 'Calma interior',
    copy: 'Pensado para acompañar momentos de pausa y regulación personal.',
  },
  {
    icon: Brain,
    title: 'Bienestar neuroambiental',
    copy: 'Una experiencia premium para crear hábitos con más intención.',
  },
  {
    icon: HeartPulse,
    title: 'Coherencia y presencia',
    copy: 'Contenido guiado para meditación, descanso y claridad mental.',
  },
];

const techFeatures = [
  ['Algodón orgánico', 'Suavidad y confort para uso cotidiano.'],
  ['Textil técnico premium', 'Capas seleccionadas para una experiencia sobria y cómoda.'],
  ['Estructura por capas', 'Diseño interno cuidado para mantener forma y ergonomía.'],
  ['Bolsillo interno', 'Espacio discreto para integrar tu ritual personal.'],
];

const kitItems = [
  {
    icon: Brain,
    title: PRODUCT_NAME,
    copy: 'Edición Founder limitada y numerada.',
  },
  {
    icon: Music,
    title: 'Audios Neurofocus',
    copy: 'Contenido premium para enfoque, calma y descanso.',
  },
  {
    icon: BookOpenCheck,
    title: 'Guía digital',
    copy: 'Método de coherencia para alinear mente, pausa y presencia.',
  },
  {
    icon: KeyRound,
    title: 'Código premium',
    copy: 'Código único para activar el acceso dentro del bot oficial de Telegram.',
  },
  {
    icon: Award,
    title: 'Certificado Founder',
    copy: 'Tu número de fundador y certificado digital.',
  },
];

const testimonials = [
  {
    name: 'Maria E.',
    role: 'Neurocoach',
    initials: 'ME',
    copy: `${PRODUCT_NAME} se volvió parte de mis pausas de trabajo y meditación. Me ayuda a sostener una rutina más consciente.`,
  },
  {
    name: 'Andres R.',
    role: 'Emprendedor',
    initials: 'AR',
    copy: 'Lo uso como recordatorio físico para desconectarme del ruido digital y volver a enfocarme durante el día.',
  },
  {
    name: 'Sofia L.',
    role: 'Terapeuta holística',
    initials: 'SL',
    copy: 'El acceso premium por Telegram hace que la experiencia sea más completa y fácil de seguir.',
  },
];

const premiumTelegramItems = [
  ['Activa tu código premium', KeyRound],
  ['Accede a guías de enfoque', Brain],
  ['Explora rutinas de regulación', Flower2],
  ['Recibe contenido de descanso', Music],
  ['Trabaja fatiga digital', Smartphone],
  ['Practica coherencia y meditación', HeartPulse],
];

const faqs = [
  {
    question: `¿Cuándo recibiré mi ${PRODUCT_NAME}?`,
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
  {
    question: '¿Cómo recibo mi código premium?',
    answer: `Después de completar la compra de ${PRODUCT_NAME}, la pantalla de éxito te mostrará un código único de activación.`,
  },
  {
    question: '¿Dónde activo mi código?',
    answer: 'Debes abrir el bot oficial de Telegram, tocar Activar código premium y pegar tu código.',
  },
  {
    question: '¿Qué pasa si mi código no funciona?',
    answer: 'Verifica que lo escribiste correctamente. Si el problema continúa, toca Soporte en Telegram para recibir ayuda.',
  },
  {
    question: '¿Puedo usar el código más de una vez?',
    answer: 'No. Cada código premium es único y solo puede activarse una vez.',
  },
];

function Brand({ compact = false }) {
  return (
    <a className="brand" href="#inicio" aria-label={`${PRODUCT_NAME} inicio`}>
      <img src="/assets/kiryus-logo.png" alt="Logo KIRYUS" />
      {!compact && (
        <span>
          <strong>BioShield</strong>
          <small>by KIRYUS™</small>
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

function TelegramButton({ children, className = '', eventName = 'click_telegram_support', location }) {
  return (
    <a
      className={`telegram-button ${className}`}
      href={telegramUrl}
      rel="noreferrer"
      target="_blank"
      onClick={() => trackEvent(eventName, { location })}
    >
      <Send size={18} aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}

function Header({ onCheckout, soldOut }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <TelegramButton className="telegram-button--header" location="header">
            Soporte en Telegram
          </TelegramButton>
          <button
            className="reserve-link"
            type="button"
            disabled={soldOut}
            onClick={() => onCheckout('header')}
          >
            {soldOut ? 'Agotado' : 'Comprar BioShield'}
            <small>Edición limitada</small>
          </button>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
          <p className="eyebrow">Nueva generación de bienestar neuroambiental</p>
          <h1>
            <span>BioShield</span>
            <strong>by KIRYUS™</strong>
          </h1>
          <p className="hero-lead">Una experiencia premium para enfoque, pausa y presencia.</p>
          <p className="hero-body">
            {PRODUCT_NAME} combina diseño textil premium con acceso digital guiado. Después de
            comprar, recibirás un código único para activar contenido premium dentro del bot oficial
            de Telegram.
          </p>
          <div className="hero-actions">
            <CtaButton disabled={soldOut} onClick={() => onCheckout('hero_primary')} size="large">
              {soldOut ? 'Actualmente agotado' : 'Comprar BioShield'}
            </CtaButton>
          </div>
          <p className="secure-note">
            <LockKeyhole size={14} />
            Compra 100% segura
          </p>
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

        <div className="hero-visual" aria-label={`Persona usando ${PRODUCT_NAME}`}>
          <img src="/assets/hero-wellness.png" alt={`Persona usando ${PRODUCT_NAME}`} />
          <div className="frequency-rings" aria-hidden="true" />
          <Brand compact />
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
          <h2>¿Tu mente realmente descansa?</h2>
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
          <img src="/assets/bioshield-layers.png" alt={`Capas internas de ${PRODUCT_NAME}`} />
          <div className="badge">
            <strong>
              <span>Bienestar</span>
              <span>Neuroambiental</span>
              <span>Premium</span>
            </strong>
            <span className="badge-stars">*****</span>
          </div>
        </div>

        <div className="tech-copy">
          <p className="eyebrow">Tecnología que</p>
          <h2>Acompaña tu mundo</h2>
          <p>
            {PRODUCT_NAME} combina materiales seleccionados, diseño ergonómico y una experiencia
            digital guiada para acompañar hábitos de enfoque, calma y presencia.
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
            <span>Edición</span>
            <strong>Founder</strong>
            <p>
              {counter
                ? `Solo ${counter.totalQuantity} unidades en el mundo`
                : 'Oferta limitada'}
            </p>
          </div>
          <img src="/assets/founder-kit.png" alt={`Kit fundador de ${PRODUCT_NAME}`} />
          <div className="price-copy">
            <span className="future-price">Precio futuro <s>$147</s></span>
            <span>Precio Fundador</span>
            <strong>$97</strong>
          </div>
          <CtaButton className="price-cta" disabled={soldOut} onClick={() => onCheckout('price_panel')}>
            {soldOut ? 'Sin unidades disponibles' : 'Primeras 30 unidades 79 dólares'}
          </CtaButton>
          <p className="shipping">
            <PackageCheck size={15} />
            Envío gratis a todo el país
          </p>
        </aside>
      </div>
    </section>
  );
}

function PremiumAccessSection({ onCheckout, soldOut }) {
  return (
    <section className="telegram-premium-section" id="premium">
      <div className="container telegram-premium-grid">
        <div>
          <p className="eyebrow">Acceso premium incluido</p>
          <h2>Después de comprar, recibes un código premium de activación</h2>
          <p>
            Con ese código podrás desbloquear el acceso premium dentro del bot oficial de Telegram.
            La activación ocurre después del pago confirmado, desde la pantalla de éxito.
          </p>
          <div className="premium-actions">
            <CtaButton disabled={soldOut} onClick={() => onCheckout('telegram_premium')}>
              {soldOut ? 'Actualmente agotado' : 'Comprar y recibir código'}
            </CtaButton>
          </div>
        </div>
        <div className="telegram-premium-list">
          {premiumTelegramItems.map(([label, Icon]) => (
            <article key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActivationSection({ onCheckout, soldOut }) {
  return (
    <section className="activation-section">
      <div className="container activation-inner">
        <div>
          <p className="eyebrow">Activa tu experiencia premium</p>
          <h2>{PRODUCT_NAME} incluye acceso premium al bot oficial de Telegram</h2>
          <p>
            Después de comprar recibirás un código único de activación para desbloquear contenido de
            enfoque, regulación, descanso, fatiga digital, coherencia y meditación.
          </p>
        </div>
        <div className="activation-actions">
          <CtaButton disabled={soldOut} onClick={() => onCheckout('activation_section')}>
            {soldOut ? 'Actualmente agotado' : 'Comprar BioShield'}
          </CtaButton>
        </div>
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
            Únete a los primeros
            <strong>
              {counter ? `${counter.totalQuantity} fundadores` : 'Edición limitada'}
            </strong>
          </p>
        </div>
        <AvailabilityCounter {...availability} />
        <div className="urgency-item urgency-item--right">
          <Clock3 aria-hidden="true" />
          <p>
            Cierre de preventa en
            <strong>07 días / 14 horas / 23 min</strong>
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
            Ritual de enfoque
          </p>
          <p>
            <Brain size={17} />
            Acceso premium
          </p>
          <p>
            <Zap size={17} />
            Activación premium
          </p>
          <strong>{PRODUCT_NAME}. Vive tu experiencia con intención.</strong>
        </div>
        <div className="footer-action">
          <CtaButton disabled={soldOut} onClick={() => onCheckout('footer')} size="large">
            {soldOut ? 'Actualmente agotado' : 'Comprar BioShield'}
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
  const [error, setError] = useState('');
  const [shippingForm, setShippingForm] = useState(emptyShippingForm);
  const [statusMessage, setStatusMessage] = useState('');
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

  const updateShippingField = (field) => (event) => {
    setShippingForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatusMessage('');

    const data = normalizeShippingForm(shippingForm);

    if (!data.fullName) {
      setError('Ingresa tu nombre completo.');
      return;
    }

    if (!data.email || !emailPattern.test(data.email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!data.phone) {
      setError('Ingresa tu WhatsApp o teléfono.');
      return;
    }

    if (!data.country) {
      setError('Ingresa tu país.');
      return;
    }

    if (!data.city) {
      setError('Ingresa tu ciudad.');
      return;
    }

    if (!data.address) {
      setError('Ingresa tu dirección completa.');
      return;
    }

    setSubmitting(true);
    let shippingSaved = false;

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

      setStatusMessage('Guardando tus datos...');
      const sheetPayload = {
        ...data,
        status: 'Pendiente de pago',
      };

      await fetch(SHIPPING_FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(sheetPayload),
      });
      shippingSaved = true;

      setStatusMessage('Datos guardados. Redirigiendo al pago...');
      const payment = await createPayment({ email: data.email, name: data.fullName });
      localStorage.setItem('paymentId', payment.paymentId);
      window.location.assign(payment.url);
    } catch (requestError) {
      setStatusMessage('');
      setError(
        shippingSaved
          ? requestError.message || 'Tus datos fueron guardados, pero no pudimos iniciar el pago.'
          : 'No se pudieron guardar tus datos. Intenta nuevamente.',
      );
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
            <span>{PRODUCT_NAME}</span>
            <h2 id="checkout-title">Datos de envío</h2>
          </div>
        </div>

        <p className="checkout-intro">
          Completa tus datos para preparar tu pedido. Después continuarás al pago seguro con Stripe.
        </p>

        {availability.counter && (
          <div className="checkout-availability">
            <strong>{availability.counter.remainingCount}</strong>
            <span>unidades disponibles de {availability.counter.totalQuantity}</span>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit}>
          <div className="shipping-form-grid">
            <label>
              Nombre completo
              <span className="input-shell">
                <UserRound size={18} aria-hidden="true" />
                <input
                  autoComplete="name"
                  maxLength={120}
                  name="fullName"
                  placeholder="Nombre completo"
                  required
                  type="text"
                  value={shippingForm.fullName}
                  onChange={updateShippingField('fullName')}
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
                  value={shippingForm.email}
                  onChange={updateShippingField('email')}
                />
              </span>
            </label>
            <label>
              WhatsApp / Teléfono
              <span className="input-shell">
                <Phone size={18} aria-hidden="true" />
                <input
                  autoComplete="tel"
                  maxLength={40}
                  name="phone"
                  placeholder="+591 70000000"
                  required
                  type="tel"
                  value={shippingForm.phone}
                  onChange={updateShippingField('phone')}
                />
              </span>
            </label>
            <label>
              País
              <span className="input-shell">
                <MapPin size={18} aria-hidden="true" />
                <input
                  autoComplete="country-name"
                  maxLength={80}
                  name="country"
                  placeholder="País"
                  required
                  type="text"
                  value={shippingForm.country}
                  onChange={updateShippingField('country')}
                />
              </span>
            </label>
            <label>
              Ciudad
              <span className="input-shell">
                <MapPin size={18} aria-hidden="true" />
                <input
                  autoComplete="address-level2"
                  maxLength={80}
                  name="city"
                  placeholder="Ciudad"
                  required
                  type="text"
                  value={shippingForm.city}
                  onChange={updateShippingField('city')}
                />
              </span>
            </label>
            <label>
              Código postal
              <span className="input-shell">
                <PackageCheck size={18} aria-hidden="true" />
                <input
                  autoComplete="postal-code"
                  maxLength={30}
                  name="postalCode"
                  placeholder="Opcional"
                  type="text"
                  value={shippingForm.postalCode}
                  onChange={updateShippingField('postalCode')}
                />
              </span>
            </label>
            <label className="form-field--wide">
              Dirección completa
              <span className="input-shell">
                <Home size={18} aria-hidden="true" />
                <input
                  autoComplete="street-address"
                  maxLength={220}
                  name="address"
                  placeholder="Calle, número, zona, edificio, departamento"
                  required
                  type="text"
                  value={shippingForm.address}
                  onChange={updateShippingField('address')}
                />
              </span>
            </label>
            <label className="form-field--wide">
              Referencia de domicilio
              <span className="input-shell">
                <Home size={18} aria-hidden="true" />
                <input
                  maxLength={180}
                  name="addressReference"
                  placeholder="Opcional"
                  type="text"
                  value={shippingForm.addressReference}
                  onChange={updateShippingField('addressReference')}
                />
              </span>
            </label>
            <label className="form-field--wide">
              Notas adicionales
              <span className="input-shell input-shell--textarea">
                <NotebookPen size={18} aria-hidden="true" />
                <textarea
                  maxLength={300}
                  name="notes"
                  placeholder="Opcional"
                  rows={3}
                  value={shippingForm.notes}
                  onChange={updateShippingField('notes')}
                />
              </span>
            </label>
          </div>

          <p className="privacy-note">
            Tus datos serán usados únicamente para gestionar tu pedido y envío.
          </p>

          {error && (
            <p className="form-error" role="alert">
              <AlertCircle size={17} aria-hidden="true" />
              {error}
            </p>
          )}

          {statusMessage && (
            <p className="form-status" role="status">
              <LoaderCircle className="is-spinning" size={17} aria-hidden="true" />
              {statusMessage}
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
                ? statusMessage || 'Guardando tus datos...'
                : 'Continuar al pago'}
          </button>
        </form>

        <div className="checkout-trust">
          <span>
            <LockKeyhole size={15} aria-hidden="true" />
            Pago procesado por Stripe
          </span>
        </div>
      </section>
    </div>
  );
}

function PremiumAccessPanel({ access, error }) {
  const [copied, setCopied] = useState(false);
  const accessPending = !access && !error;
  const accessTelegramUrl = access?.telegramUrl || telegramUrl;
  const hasCode = Boolean(access?.premiumCode);
  const waitingForCode = access?.success === false || access?.noCodesAvailable || access?.codeStatus === 'pending';

  const copyCode = async () => {
    if (!access?.premiumCode) return;

    try {
      await navigator.clipboard.writeText(access.premiumCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="founder-access" aria-labelledby="premium-access-title">
      <p className="eyebrow">Acceso premium</p>
      <h2 id="premium-access-title">Tu acceso premium ya está listo</h2>

      {accessPending && (
        <p className="founder-access-status">
          <LoaderCircle className="is-spinning" size={17} aria-hidden="true" />
          Generando tu código premium...
        </p>
      )}

      {error && (
        <p className="founder-access-status founder-access-status--error">
          <AlertCircle size={17} aria-hidden="true" />
          {error}
        </p>
      )}

      {hasCode && (
        <>
          <p>
            Gracias por adquirir {PRODUCT_NAME}. Guarda este código y úsalo dentro del bot oficial
            de Telegram para activar tu acceso premium.
          </p>
          <div className="premium-code-box">
            <span>Tu código de activación</span>
            <strong>{access.premiumCode}</strong>
          </div>
          <ol className="activation-steps">
            <li>Guarda este código.</li>
            <li>Abre el bot de Telegram.</li>
            <li>Toca Activar código premium y escribe este código exactamente como aparece.</li>
            <li>Solo se puede activar una vez. Si tienes problemas, contacta soporte.</li>
          </ol>
        </>
      )}

      {waitingForCode && (
        <p>
          {access?.message ||
            'No hay códigos disponibles en este momento. Escríbenos para ayudarte.'}
        </p>
      )}

      {access?.contentConfigured && (
        <div className="founder-access-grid">
          <article>
            <BookOpenCheck aria-hidden="true" />
            <div>
              <h3>Guía digital</h3>
              <p>Material privado para enfoque, pausa y coherencia.</p>
            </div>
          </article>
          <article>
            <Music aria-hidden="true" />
            <div>
              <h3>Audios Neurofocus</h3>
              <p>Contenido de acompañamiento para descanso y concentración.</p>
            </div>
          </article>
        </div>
      )}

      <div className="founder-access-actions">
        {hasCode && (
          <button className="founder-access-button" type="button" onClick={copyCode}>
            <Copy size={18} aria-hidden="true" />
            {copied ? 'Código copiado' : 'Copiar código'}
          </button>
        )}
        <a
          className="founder-access-button founder-access-button--outline"
          href={accessTelegramUrl}
          rel="noreferrer"
          target="_blank"
          onClick={() => trackEvent('telegram_activation_click', { location: 'success', hasCode })}
        >
          <Send size={18} aria-hidden="true" />
          {hasCode ? 'Activar en Telegram' : 'Contactar soporte en Telegram'}
        </a>
        {access?.contentConfigured && (
          <a
            className="founder-access-button"
            href={access.contentUrl}
            rel="noreferrer"
            target="_blank"
          >
            <BookOpenCheck size={18} aria-hidden="true" />
            Descargar guía y audios
          </a>
        )}
      </div>
    </section>
  );
}

function SuccessPage() {
  const availability = useAvailability();
  const [premiumAccess, setPremiumAccess] = useState(null);
  const [premiumAccessError, setPremiumAccessError] = useState('');
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
            const claim = await claimPremiumCode({
              orderId: paymentId,
              customerEmail: nextPayment.email,
              customerName: nextPayment.name,
            });
            if (!active) return;
            setPremiumAccess({
              success: claim.success,
              premiumCode: claim.code || null,
              message:
                claim.message ||
                (claim.success ? '' : 'No hay códigos disponibles en este momento. Escríbenos para ayudarte.'),
              telegramUrl,
              contentConfigured: false,
            });
            setPremiumAccessError('');
          } catch {
            if (!active) return;
            setPremiumAccessError(
              'No pudimos generar tu código premium en este momento. Contacta soporte en Telegram.',
            );
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
      title: 'Compra confirmada',
      copy: `Gracias por adquirir ${PRODUCT_NAME}. Tu compra fue confirmada por Stripe.`,
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
        <p className="eyebrow">Estado de tu compra</p>
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
          <PremiumAccessPanel access={premiumAccess} error={premiumAccessError} />
        )}

        <div className="success-actions">
          <a className="cta-button" href="/">
            Volver a la landing
          </a>
          <a
            className="support-link"
            href={telegramUrl}
            rel="noreferrer"
            target="_blank"
            onClick={() => trackEvent('click_telegram_support', { location: 'success' })}
          >
            <Send size={17} aria-hidden="true" />
            Soporte por Telegram
          </a>
        </div>
      </section>
    </main>
  );
}

function FloatingTelegramButton() {
  return (
    <a
      className="floating-telegram"
      href={telegramUrl}
      rel="noreferrer"
      target="_blank"
      onClick={() => trackEvent('click_telegram_support', { location: 'floating' })}
    >
      <MessageCircle size={19} aria-hidden="true" />
      <span>Telegram</span>
    </a>
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
  const openCheckout = (location) => {
    trackEvent('click_buy', { location });
    setCheckoutOpen(true);
  };

  return (
    <>
      <Header onCheckout={openCheckout} soldOut={soldOut} />
      <main>
        <Hero onCheckout={openCheckout} soldOut={soldOut} />
        <MindShift />
        <Technology
          counter={availability.counter}
          onCheckout={openCheckout}
          soldOut={soldOut}
        />
        <PremiumAccessSection onCheckout={openCheckout} soldOut={soldOut} />
        <UrgencyBand availability={availability} />
        <ActivationSection onCheckout={openCheckout} soldOut={soldOut} />
        <Testimonials />
        <FAQ />
      </main>
      <FooterCta onCheckout={openCheckout} soldOut={soldOut} />
      <FloatingTelegramButton />
      <CheckoutModal
        availability={availability}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
