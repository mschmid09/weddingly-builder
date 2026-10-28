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
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
  guestName,
}: HeroSectionProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section
      className={`guest-hero ${heroImageUrl ? 'guest-hero-photo' : ''}`}
      style={{
        backgroundImage: heroImageUrl
          ? `linear-gradient(0deg, #14261fc4, #14261f08 85%), url(${heroImageUrl})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="guest-hero-content">
        <div className="max-w-4xl mx-auto">
          {/* Personalized Greeting */}
          {guestName && (
            <p
              className="text-lg sm:text-xl md:text-2xl font-light mb-4 tracking-wide"
              style={{
                textShadow: heroImageUrl
                  ? '1px 1px 2px rgba(0,0,0,0.5)'
                  : 'none',
                color: heroImageUrl ? '#ffffff' : '#666',
                fontFamily: headingFont,
              }}
            >
              Dear {guestName},
            </p>
          )}

          {/* Invitation Text */}
          <p
            className="text-base sm:text-lg md:text-xl font-light mb-6 tracking-wide"
            style={{
              textShadow: heroImageUrl
                ? '1px 1px 2px rgba(0,0,0,0.5)'
                : 'none',
              color: heroImageUrl ? '#ffffff' : '#666',
            }}
          >
            Together with our families
          </p>

          {/* Names */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-lg"
            style={{
              fontFamily: headingFont,
              textShadow: heroImageUrl
                ? '2px 2px 4px rgba(0,0,0,0.5)'
                : 'none',
              color: heroImageUrl ? '#ffffff' : '#333',
            }}
          >
            {brideName} & {groomName}
          </h1>

          {/* Date */}
          {weddingDate && (
            <p
              className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide"
              style={{
                textShadow: heroImageUrl
                  ? '1px 1px 2px rgba(0,0,0,0.5)'
                  : 'none',
                color: heroImageUrl ? '#ffffff' : '#666',
              }}
            >
              {formatDate(weddingDate)}
            </p>
          )}

          <a className="guest-reply-link" href="#rsvp">Kindly reply <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
