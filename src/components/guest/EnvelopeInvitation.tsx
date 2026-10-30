import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import './postcard.css';

interface EnvelopeInvitationProps {
  brideName?: string;
  groomName?: string;
  guestName?: string;
  headingFont?: string;
  postcardImageUrl?: string;
  postcardStampUrl?: string;
  weddingDate?: string;
  children?: ReactNode;
}

const defaultPhoto =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85';

// PP envelope source ratio (1152×1616)
const ENV_RATIO = 1152 / 1616;

export function EnvelopeInvitation({
  brideName,
  groomName,
  guestName,
  headingFont = 'Playfair Display',
  postcardImageUrl,
  postcardStampUrl,
  weddingDate,
  children,
}: EnvelopeInvitationProps) {
  const reducedMotion = useReducedMotion();
  const trackRef  = useRef<HTMLElement>(null);
  const stageRef  = useRef<HTMLDivElement>(null);
  const heroRef   = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);

  const [heroSide, setHeroSide] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const mobile = viewport.width <= 600;

  // Envelope sized to PP's native 1152:1616 ratio
  // Cap height to 62% of viewport so it doesn't look elongated on short screens
  const envW = Math.min(
    Math.round(viewport.height * 0.62 * ENV_RATIO),
    mobile ? Math.round(viewport.width * 0.84) : Math.round(viewport.width * 0.40),
    mobile ? 280 : 400,
  );
  const envH = Math.round(envW / ENV_RATIO);

  // Card slightly smaller than envelope
  const cardW = envW - 20;
  const cardH = Math.round(cardW / 0.714);

  // PP: envelope pushed down 63% of its height from center (mostly off-screen below)
  const envPushDown = Math.round(envH * 0.63);

  // Card starts mostly hidden inside the envelope (~top 8% peeking above the opening)
  const cardStartY = Math.round(envH * 0.50);

  // ── Scroll timeline (340svh track) ───────────────────────────────────────
  // [0.04 → 0.38]  card rises from envelope (already open)
  // [0.28 → 0.46]  envelope fades
  // [0.44 → 0.58]  card flips to hero
  // [0.58 → 0.80]  dwell on hero face
  // [0.80 → 1.00]  card expands to full screen

  const cardLift        = useTransform(scrollYProgress, [0.04, 0.38], [cardStartY, 0]);
  const envelopeDrop    = useTransform(scrollYProgress, [0.04, 0.38], [0, Math.round(envH * 0.28)]);
  const envelopeY       = useTransform(envelopeDrop, v => `calc(-50% + ${envPushDown + v}px)`);
  const cardY           = useTransform(cardLift, v => `calc(-50% + ${v}px)`);
  const envelopeOpacity = useTransform(scrollYProgress, [0.22, 0.38], [1, 0]);
  const rotation        = useTransform(scrollYProgress, [0.44, 0.58], [0, 180]);
  const heroOpacity     = useTransform(rotation, [89, 91], [0, 1]);
  const cardWidth       = useTransform(scrollYProgress, [0.44, 0.58, 0.80, 1.0], [cardW, cardW, cardW, viewport.width]);
  const cardHeight      = useTransform(scrollYProgress, [0.44, 0.58, 0.80, 1.0], [cardH, cardH, cardH, viewport.height]);
  const borderPad       = useTransform(scrollYProgress, [0.80, 1.0], [mobile ? 9 : 12, 0]);
  const tapPromptOpacity = useTransform(scrollYProgress, [0.60, 0.68, 0.76, 0.84], [0, 1, 1, 0]);
  const hintOpacity     = useTransform(scrollYProgress, [0, 0.05, 0.22], [0, 1, 0]);
  const navOpacity      = useTransform(scrollYProgress, [0.60, 0.74], [1, 0]);

  const couple    = [brideName, groomName].filter(Boolean).join(' & ') || 'Our wedding';
  const photo     = postcardImageUrl || defaultPhoto;
  const date      = weddingDate ? new Date(weddingDate) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
    : '';

  useEffect(() => {
    const measure = () => {
      if (!stageRef.current) return;
      const b = stageRef.current.getBoundingClientRect();
      setViewport({ width: b.width, height: b.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', p => {
    setHeroSide(p >= 0.60);
    setRevealed(p >= 0.98);
    if (p >= 0.995 && focusOnOpen.current) {
      focusOnOpen.current = false;
      heroRef.current?.focus({ preventScroll: true });
    }
  });

  const scrollToProgress = (target: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const top = window.scrollY + track.getBoundingClientRect().top;
    window.scrollTo({
      top: top + (track.offsetHeight - stage.offsetHeight) * target,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  };

  const noteVisible = !heroSide;

  return (
    <section
      ref={trackRef}
      data-hero-side={heroSide}
      className={`postcard-scroll-track${reducedMotion ? ' postcard-reduced' : ''}`}
      style={{ fontFamily: headingFont }}
    >
      <div ref={stageRef} className="postcard-stage">
        <div className="postcard-backdrop" />

        {/* Envelope back layers — behind the card */}
        {!reducedMotion && (
          <motion.div
            className="postcard-envelope"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: envelopeY,
              opacity: envelopeOpacity,
              width: envW,
              height: envH,
              zIndex: 1,
            }}
          >
            <img className="env-layer" src="/envelope/pp-envelopeBackFlap.png" alt="" />
            <img className="env-layer" src="/envelope/pp-envelopeBackBase.png" alt="" />
            <img className="env-layer" src="/envelope/pp-envelopeBackCover.png" alt="" />
          </motion.div>
        )}

        {/* Card — rises through the envelope opening */}
        <motion.div
          className="postcard-arrival"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            x: '-50%',
            y: reducedMotion
              ? heroSide ? 'calc(-50%)' : `calc(-50% + ${cardStartY}px)`
              : cardY,
            width:  reducedMotion ? (heroSide ? viewport.width  : cardW) : cardWidth,
            height: reducedMotion ? (heroSide ? viewport.height : cardH) : cardHeight,
            zIndex: 2,
          }}
        >
          <motion.div
            className="postcard"
            style={{ rotateY: reducedMotion ? 0 : rotation }}
          >
            {/* BACK face — invitation postcard */}
            <div
              className="postcard-face postcard-back"
              aria-hidden={!noteVisible}
              {...(!noteVisible ? ({ inert: 'true' } as Record<string, string>) : {})}
            >
              <div className="postcard-postage" aria-label="Postage">
                <div className="postcard-stamp">
                  <img
                    src={postcardStampUrl || photo}
                    alt=""
                    onError={e => { if (e.currentTarget.src !== defaultPhoto) e.currentTarget.src = defaultPhoto; }}
                  />
                  <span>LOVE / FOREVER</span>
                </div>
              </div>

              <div className="postcard-message">
                <span className="postcard-eyebrow">Together with our families</span>
                <h1>You're invited.</h1>
                <p className="postcard-note">
                  To a day we'll remember forever.
                  <br />It wouldn't be the same without you.
                </p>
                <p className="postcard-signature">{couple}</p>
                {dateLabel && <p className="postcard-date">{dateLabel}</p>}
              </div>

              <div className="postcard-recipient">
                <span className="postcard-eyebrow">Especially for</span>
                <p>{guestName || 'Our dearest friends & family'}</p>
              </div>

              <button
                className="postcard-open"
                onClick={e => { e.stopPropagation(); focusOnOpen.current = true; scrollToProgress(1); }}
              >
                Open invitation <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>

            {/* FRONT face — hero content */}
            <motion.div
              className="postcard-face postcard-front"
              style={{ padding: reducedMotion && heroSide ? 0 : borderPad }}
              aria-hidden={noteVisible}
            >
              <div className="postcard-surface">
                {children ? (
                  <motion.div
                    ref={heroRef}
                    tabIndex={-1}
                    className="postcard-hero"
                    style={{ opacity: reducedMotion ? (heroSide ? 1 : 0) : heroOpacity }}
                    {...(!revealed ? ({ inert: 'true' } as Record<string, string>) : {})}
                    aria-hidden={!heroSide}
                  >
                    {children}
                  </motion.div>
                ) : (
                  <img
                    className="postcard-photo"
                    src={photo} alt={couple}
                    onError={e => { if (e.currentTarget.src !== defaultPhoto) e.currentTarget.src = defaultPhoto; }}
                  />
                )}
              </div>
              {!reducedMotion && (
                <motion.button
                  className="postcard-open-full"
                  style={{ opacity: tapPromptOpacity, pointerEvents: heroSide && !revealed ? 'auto' : 'none' }}
                  tabIndex={heroSide && !revealed ? 0 : -1}
                  aria-hidden={!heroSide || revealed}
                  onClick={() => { focusOnOpen.current = true; scrollToProgress(1); }}
                >
                  Open invitation <ArrowRight size={17} aria-hidden="true" />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Envelope front layers — in front of card */}
        {!reducedMotion && (
          <motion.div
            className="postcard-envelope"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: envelopeY,
              opacity: envelopeOpacity,
              width: envW,
              height: envH,
              zIndex: 3,
            }}
          >
            <img className="env-layer" src="/envelope/pp-envelopeFrontBase.png" alt="" />
            <img className="env-layer" src="/envelope/pp-envelopeFrontFlapShadow.png" alt="" />
            <img className="env-layer" src="/envelope/pp-envelopeFrontFlap.png" alt="" />
          </motion.div>
        )}

        {!reducedMotion && (
          <motion.div className="postcard-scroll-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            <ChevronDown size={18} />
            <span>scroll to open</span>
          </motion.div>
        )}

        <motion.button
          className="postcard-turn"
          style={{ opacity: navOpacity }}
          tabIndex={revealed ? -1 : 0}
          onClick={() => scrollToProgress(heroSide ? 0.28 : 0.72)}
          aria-label={heroSide ? 'Back to invitation' : 'Open invitation'}
        >
          <ArrowRight size={19} aria-hidden="true"
            style={{ transform: heroSide ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
        </motion.button>
      </div>
    </section>
  );
}
