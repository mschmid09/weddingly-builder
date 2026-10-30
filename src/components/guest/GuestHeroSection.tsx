import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: Date | string | null;
  heroImageUrl?: string;
  primaryColor?: string;
  headingFont?: string;
  guestName?: string;
}

export function GuestHeroSection({
  brideName,
  groomName,
  weddingDate,
  heroImageUrl,
  headingFont = 'Playfair Display',
  guestName,
}: HeroSectionProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });
  };

  return (
    <section
      className={`guest-hero${heroImageUrl ? ' guest-hero-photo' : ''}`}
      style={{
        backgroundImage: heroImageUrl
          ? `linear-gradient(to top, #0e1a14cc 0%, #0e1a1440 55%, transparent 100%), url(${heroImageUrl})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="guest-hero-content" style={{ fontFamily: headingFont }}>
        {guestName && (
          <p className="guest-hero-dear">
            Dear {guestName},
          </p>
        )}
        <p className="guest-hero-eyebrow">Together with their families</p>
        <h1>{brideName} &amp; {groomName}</h1>
        {weddingDate && (
          <p className="guest-hero-date">{formatDate(weddingDate)}</p>
        )}
        <a className="guest-reply-link" href="#rsvp">
          Kindly reply <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
