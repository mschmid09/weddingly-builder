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

  const cardW = Math.min(
    mobile ? Math.round(viewport.width * 0.92) : Math.round(viewport.width * 0.60),
    mobile ? 380 : 600,
  );
  const cardH = Math.round(cardW / 1.5);

  const cardStartY = Math.round(viewport.height * 0.38);

  const cardLift        = useTransform(scrollYProgress, [0.0, 0.32], [cardStartY, 0]);
  const cardY           = useTransform(cardLift, v => `calc(-50% + ${v}px)`);
  const rotation        = useTransform(scrollYProgress, [0.50, 0.64], [0, 180]);
  const heroOpacity     = useTransform(rotation, [89, 91], [0, 1]);
  const cardWidth       = useTransform(scrollYProgress, [0.84, 1.0], [cardW, viewport.width]);
  const cardHeight      = useTransform(scrollYProgress, [0.84, 1.0], [cardH, viewport.height]);
  const borderPad       = useTransform(scrollYProgress, [0.84, 1.0], [mobile ? 11 : 16, 0]);
  const tapPromptOpacity = useTransform(scrollYProgress, [0.66, 0.74, 0.82, 0.90], [0, 1, 1, 0]);
  const hintOpacity     = useTransform(scrollYProgress, [0, 0.06, 0.22], [0, 1, 0]);
  const navOpacity      = useTransform(scrollYProgress, [0.66, 0.80], [1, 0]);

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
    setHeroSide(p >= 0.57);
    setRevealed(p >= 0.98);
    if (p >= 0.995 && focusOnOpen.current) {
      focusOnOpen.current = false;
      heroRef.current?.focus({ preventScroll: true });
    }
  });

  const scrollToProgress = (target: number, duration = 1400) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const dest = window.scrollY + track.getBoundingClientRect().top + (track.offsetHeight - stage.offsetHeight) * target;
    if (reducedMotion) { window.scrollTo({ top: dest, behavior: 'instant' }); return; }
    const start = window.scrollY;
    const dist = dest - start;
    const t0 = performance.now();
    const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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
        <div className="postcard-backdrop" style={{ backgroundImage: `url(${photo})` }} />

        {/* Card — rises from below */}
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
              <div className="postcard-body">
                <div className="postcard-left">
                  <div className="postcard-message">
                    <h1>You're invited.</h1>
                    <p className="postcard-note">
                      To a day we'll remember forever.
                      <br />It wouldn't be the same without you.
                    </p>
                    <p className="postcard-signature">{couple}</p>
                    {dateLabel && <p className="postcard-date">{dateLabel}</p>}
                  </div>
                  <button
                    className="postcard-open"
                    onClick={e => { e.stopPropagation(); focusOnOpen.current = true; scrollToProgress(1, 2400); }}
                  >
                    Open invitation <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
                <div className="postcard-divider-line" aria-hidden="true" />
                <div className="postcard-right">
                  <div className="postcard-postage" aria-label="Postage">
                    <div className="postcard-stamp">
                      <img
                        src={postcardStampUrl || photo}
                        alt=""
                        onError={e => { if (e.currentTarget.src !== defaultPhoto) e.currentTarget.src = defaultPhoto; }}
                      />
                    </div>
                  </div>
                  <div className="postcard-recipient">
                    <span className="postcard-eyebrow">To</span>
                    <p>{guestName || 'Our dearest friends & family'}</p>
                    <div className="postcard-address-lines" aria-hidden="true">
                      <div /><div /><div />
                    </div>
                  </div>
                </div>
              </div>
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
            </motion.div>
          </motion.div>
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

        {!reducedMotion && (
          <motion.div className="postcard-scroll-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            <ChevronDown size={18} />
          </motion.div>
        )}

        <motion.button
          className="postcard-turn"
          style={{ opacity: navOpacity }}
          tabIndex={revealed ? -1 : 0}
          onClick={() => scrollToProgress(heroSide ? 0.25 : 0.76)}
          aria-label={heroSide ? 'Back to invitation' : 'Open invitation'}
        >
          <ArrowRight size={19} aria-hidden="true"
            style={{ transform: heroSide ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
        </motion.button>
      </div>
    </section>
  );
}
