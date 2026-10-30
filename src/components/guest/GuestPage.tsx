import { useState, useEffect } from 'react';
import { PasswordPrompt } from './PasswordPrompt';
import { EnvelopeInvitation } from './EnvelopeInvitation';
import { GuestHeroSection } from './GuestHeroSection';
import { GuestEventsSection } from './GuestEventsSection';
import { GuestStorySection } from './GuestStorySection';
import { GuestGallerySection } from './GuestGallerySection';
import { GuestRegistrySection } from './GuestRegistrySection';
import { RSVPForm } from './RSVPForm';
import './guest.css';
import { decodeGuestName, hexToRgb } from '../../lib/utils';

interface WeddingSite {
  id: string;
  slug: string;
  isPublished: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  heroEnabled: boolean;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  heroImageUrl?: string;
  postcardImageUrl?: string;
  postcardStampUrl?: string;
  storyEnabled: boolean;
  storyTitle: string;
  storyText?: string;
  storyImage1Url?: string;
  storyImage2Url?: string;
  galleryEnabled: boolean;
  galleryTitle: string;
  galleryImages: string[];
  registryEnabled: boolean;
  registryTitle: string;
  registryText?: string;
  events: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    address: string;
  }>;
}

interface GuestPageProps {
  slug: string;
}

export default function GuestPage({ slug }: GuestPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(
    null,
  );
  const [weddingSite, setWeddingSite] = useState<WeddingSite | null>(
    null,
  );
  const [guestName, setGuestName] = useState<string | null>(null);
  useEffect(() => {
    // Get guest name from URL parameter
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    if (toParam) {
      setGuestName(decodeGuestName(toParam));
    }

    fetchWeddingSite();
  }, [slug]);

  const sessionKey = `ws_${slug}`;

  const fetchWeddingSite = async () => {
    // Restore from sessionStorage to survive HMR remounts without re-prompting
    try {
      const cached = sessionStorage.getItem(sessionKey);
      if (cached) {
        setWeddingSite(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {}

    try {
      const response = await fetch(`/api/wedding/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Wedding site not found');
        } else if (response.status === 403) {
          setError('This wedding site is not published yet');
        } else {
          setError(data.error || 'Failed to load wedding site');
        }
        setLoading(false);
        return;
      }

      if (data.hasPassword) {
        setRequiresPassword(true);
        setLoading(false);
      } else {
        try { sessionStorage.setItem(sessionKey, JSON.stringify(data.weddingSite)); } catch {}
        setWeddingSite(data.weddingSite);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load wedding site');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await fetch(`/api/wedding/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Incorrect password');
        return;
      }

      try { sessionStorage.setItem(sessionKey, JSON.stringify(data.weddingSite)); } catch {}
      setWeddingSite(data.weddingSite);
      setRequiresPassword(false);
      setPasswordError(null);
    } catch (err) {
      setPasswordError('Failed to verify password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-600" role="status">Opening your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation unavailable
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <PasswordPrompt
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
        primaryColor={weddingSite?.primaryColor}
        headingFont={weddingSite?.headingFont}
      />
    );
  }

  if (!weddingSite) {
    return null;
  }

  const inkRgb = hexToRgb(weddingSite.primaryColor);
  const mutedRgb = hexToRgb(weddingSite.secondaryColor);
  const colorVars = inkRgb && mutedRgb ? {
    '--guest-ink': weddingSite.primaryColor,
    '--guest-muted': weddingSite.secondaryColor,
    '--guest-rule': `rgba(${inkRgb[0]},${inkRgb[1]},${inkRgb[2]},0.18)`,
    '--guest-accent': weddingSite.accentColor,
  } as React.CSSProperties : {};

  return (
    <>
      {/* Main Content */}
        <div
          id="guest-invitation"
          tabIndex={-1}
          className="guest-stationery"
          style={{
            fontFamily: weddingSite.bodyFont,
            ...colorVars,
          }}
        >
          {/* Content with higher z-index */}
          <div className="relative z-10">
            {/* Hero Section */}
            <EnvelopeInvitation
              brideName={weddingSite.brideName}
              groomName={weddingSite.groomName}
              guestName={guestName || undefined}
              headingFont={weddingSite.headingFont}
              postcardImageUrl={weddingSite.postcardImageUrl || weddingSite.heroImageUrl}
              postcardStampUrl={weddingSite.postcardStampUrl}
              weddingDate={weddingSite.weddingDate}
            >
              {weddingSite.heroEnabled && (
                <GuestHeroSection
                  brideName={weddingSite.brideName}
                  groomName={weddingSite.groomName}
                  weddingDate={weddingSite.weddingDate}
                  heroImageUrl={weddingSite.heroImageUrl || weddingSite.postcardImageUrl}
                  primaryColor={weddingSite.primaryColor}
                  headingFont={weddingSite.headingFont}
                  guestName={guestName || undefined}
                />
              )}
            </EnvelopeInvitation>
            {/* Divider */}
            {weddingSite.heroEnabled &&
              weddingSite.events &&
              weddingSite.events.length > 0 && (
                <hr className="guest-rule" />
              )}
            {/* Events Section */}
            {weddingSite.events && weddingSite.events.length > 0 && (
              <GuestEventsSection
                events={weddingSite.events}
                primaryColor={weddingSite.primaryColor}
                secondaryColor={weddingSite.secondaryColor}
                headingFont={weddingSite.headingFont}
                bodyFont={weddingSite.bodyFont}
              />
            )}
            {/* Divider */}
            {weddingSite.storyEnabled && (
              <hr className="guest-rule" />
            )}
            {/* Story Section */}
            {weddingSite.storyEnabled && (
              <GuestStorySection
                storyTitle={weddingSite.storyTitle}
                storyText={weddingSite.storyText}
                storyImage1Url={weddingSite.storyImage1Url}
                storyImage2Url={weddingSite.storyImage2Url}
                primaryColor={weddingSite.primaryColor}
                headingFont={weddingSite.headingFont}
                bodyFont={weddingSite.bodyFont}
              />
            )}
            {/* Divider */}
            {weddingSite.galleryEnabled && (
              <hr className="guest-rule" />
            )}
            {/* Gallery Section */}
            {weddingSite.galleryEnabled && (
              <GuestGallerySection
                galleryTitle={weddingSite.galleryTitle}
                galleryImages={weddingSite.galleryImages}
                primaryColor={weddingSite.primaryColor}
                headingFont={weddingSite.headingFont}
              />
            )}
            {/* Divider */}
            {weddingSite.registryEnabled && (
              <hr className="guest-rule" />
            )}
            {/* Registry Section */}
            {weddingSite.registryEnabled && (
              <GuestRegistrySection
                registryTitle={weddingSite.registryTitle}
                registryText={weddingSite.registryText}
                primaryColor={weddingSite.primaryColor}
                secondaryColor={weddingSite.secondaryColor}
                headingFont={weddingSite.headingFont}
                bodyFont={weddingSite.bodyFont}
              />
            )}
            {/* RSVP Section */}
            <section
              id="rsvp"
              className="guest-reply guest-section"
            >
              <div className="max-w-2xl mx-auto">
                <p className="guest-kicker">A note in return</p>
                <h2 style={{ fontFamily: weddingSite.headingFont, textAlign: 'center' }}>
                  Kindly reply
                </h2>
                <div className="guest-reply-form">
                  <RSVPForm
                    siteSlug={weddingSite.slug}
                    primaryColor={weddingSite.primaryColor}
                    accentColor={weddingSite.accentColor}
                    guestName={guestName || undefined}
                  />
                </div>
              </div>
            </section>
            <footer className="guest-footer">
              <p style={{ fontFamily: weddingSite.headingFont }}>{weddingSite.brideName} &amp; {weddingSite.groomName}</p>
              <span>With love, always.</span>
            </footer>
          </div>
        </div>
    </>
  );
}
