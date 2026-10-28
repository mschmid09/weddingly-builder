import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import './postcard.css';

interface EnvelopeInvitationProps {
  brideName?: string;
  groomName?: string;
  guestName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string;
  postcardImageUrl?: string;
  postcardStampUrl?: string;
  weddingDate?: string;
  children?: ReactNode;
}

const defaultPhoto = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85';

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
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);
  const [noteVisible, setNoteVisible] = useState(!!reducedMotion);
  const [heroSide, setHeroSide] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const mobile = viewport.width <= 600;
  const ratio = mobile ? 0.65 : 1.56;
  const initialWidth = Math.min(mobile ? 430 : 840, viewport.width - 44, Math.max(220, viewport.height - 110) * ratio);
  const width = useTransform(scrollYProgress, [0, 0.52, 0.84, 1], [initialWidth, initialWidth, viewport.width, viewport.width]);
  const height = useTransform(scrollYProgress, [0, 0.52, 0.84, 1], [initialWidth / ratio, initialWidth / ratio, viewport.height, viewport.height]);
  const rotation = useTransform(scrollYProgress, [0, 0.18, 0.38, 0.62, 1], [0, 180, 180, 360, 360]);
  const tilt = useTransform(scrollYProgress, [0, 0.5, 0.84], [-2, -2, 0]);
  const border = useTransform(scrollYProgress, [0, 0.52, 0.84], [mobile ? 9 : 12, mobile ? 9 : 12, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const controlsOpacity = useTransform(scrollYProgress, [0.38, 0.5], [1, 0]);
  const couple = [brideName, groomName].filter(Boolean).join(' & ') || 'Our wedding';
  const photo = postcardImageUrl || defaultPhoto;
  const date = weddingDate ? new Date(weddingDate) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
    : '';

  useEffect(() => {
    const measure = () => {
      if (!stageRef.current) return;
      const bounds = stageRef.current.getBoundingClientRect();
      setViewport({ width: bounds.width, height: bounds.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    setNoteVisible(reducedMotion ? progress < 0.5 : progress >= 0.12 && progress < 0.5);
    setHeroSide(progress >= 0.5);
    setRevealed(progress >= 0.98);
    if (progress >= 0.995 && focusOnOpen.current) {
      focusOnOpen.current = false;
      heroRef.current?.focus({ preventScroll: true });
    }
  });

  const scrollToProgress = (progress: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const top = window.scrollY + track.getBoundingClientRect().top;
    window.scrollTo({ top: top + (track.offsetHeight - stage.offsetHeight) * progress, behavior: reducedMotion ? 'instant' : 'smooth' });
  };

  return (
    <section ref={trackRef} data-hero-side={heroSide} className={`postcard-scroll-track${reducedMotion ? ' postcard-reduced' : ''}`} style={{ fontFamily: headingFont }}>
      <div ref={stageRef} className="postcard-stage">
      <div className="postcard-backdrop" />
      <motion.div
        className="postcard-arrival"
        style={{ width: reducedMotion ? (heroSide ? viewport.width : initialWidth) : width, height: reducedMotion ? (heroSide ? viewport.height : initialWidth / ratio) : height, rotate: reducedMotion ? 0 : tilt }}
      >
        <motion.div
          className="postcard"
          style={{ rotateY: reducedMotion ? 0 : rotation }}
        >
          <motion.div className="postcard-face postcard-front" style={{ padding: reducedMotion && heroSide ? 0 : border }} aria-hidden={noteVisible}>
            <div className="postcard-surface">
            <img hidden={heroSide && !!children} className="postcard-photo" src={photo} alt={`A postcard from ${couple}`} onError={event => { if (event.currentTarget.src !== defaultPhoto) event.currentTarget.src = defaultPhoto; }} />
            <motion.div className="postcard-photo-caption" style={{ opacity: captionOpacity }}>
              <span>A little note from</span>
              <p>{couple}</p>
              {dateLabel && <span>{dateLabel}</span>}
            </motion.div>
            {children && <div ref={heroRef} tabIndex={-1} className="postcard-hero" style={{ visibility: heroSide ? 'visible' : 'hidden' }} inert={!revealed} aria-hidden={!heroSide}>
              {children}
            </div>}
            </div>
          </motion.div>

          <div className="postcard-face postcard-back" aria-hidden={!noteVisible} inert={!noteVisible}>
            <div className="postcard-message">
              <span className="postcard-eyebrow">Together with our families</span>
              <h1>You're invited.</h1>
              <p className="postcard-note">To a day we'll remember forever.<br />It wouldn't be the same without you.</p>
              <p className="postcard-signature">{couple}</p>
              {dateLabel && <p className="postcard-date">{dateLabel}</p>}
              <button className="postcard-open" onClick={() => { focusOnOpen.current = true; scrollToProgress(1); }}>
                Open invitation <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="postcard-address">
              <div className="postcard-postage" aria-label="Postage stamp">
                <div className="postcard-postmark" aria-hidden="true"><span>WITH LOVE</span><span>THE WEDDING POST</span></div>
                <div className="postcard-stamp">
                  <img src={postcardStampUrl || photo} alt="" onError={event => { if (event.currentTarget.src !== defaultPhoto) event.currentTarget.src = defaultPhoto; }} />
                  <span>LOVE / FOREVER</span>
                </div>
              </div>
              <div className="postcard-recipient">
                <span>Especially for</span>
                <p>{guestName || 'Our dearest friends & family'}</p>
                <div className="postcard-address-line" />
                <div className="postcard-address-line" />
              </div>
              <span className="postcard-airmail">A note worth keeping</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.button className="postcard-turn" style={{ opacity: controlsOpacity }} tabIndex={revealed ? -1 : 0} onClick={() => scrollToProgress(noteVisible ? 0 : 0.26)} aria-label={noteVisible ? 'View postcard photo' : 'Read postcard invitation'} title={noteVisible ? 'View postcard photo' : 'Read postcard invitation'}>
        <RotateCcw size={19} aria-hidden="true" />
      </motion.button>
      </div>
    </section>
  );
}
