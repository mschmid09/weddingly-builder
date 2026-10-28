import { encodeGuestName } from './utils';

interface InvitationEmailDetails {
  brideName?: string;
  groomName?: string;
  weddingDate?: Date | string | null;
  postcardImageUrl?: string;
  heroImageUrl?: string;
  postcardStampUrl?: string;
  guestName?: string;
  baseUrl: string;
}

function emailImage(value: string, stamp = false) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('Email images must use a hosted HTTP or HTTPS URL.');
  }
  if (url.hostname === 'res.cloudinary.com') {
    const transformation = stamp
      ? 'c_fill,g_auto,w_120,h_152,q_auto:good,f_jpg'
      : 'c_limit,w_600,q_auto:good,f_jpg';
    url.pathname = url.pathname.replace('/image/upload/', `/image/upload/${transformation}/`);
  }
  return url.href;
}

export function renderInvitationEmail(template: string, details: InvitationEmailDetails) {
  const invitationUrl = new URL('/', details.baseUrl);
  if (!['https:', 'http:'].includes(invitationUrl.protocol)) {
    throw new Error('The invitation must use an HTTP or HTTPS URL.');
  }
  const guestName = details.guestName?.trim();
  if (guestName) invitationUrl.searchParams.set('to', encodeGuestName(guestName));
  const photo = details.postcardImageUrl || details.heroImageUrl
    || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=70';
  const date = details.weddingDate ? new Date(details.weddingDate) : null;
  const values: Record<string, string> = {
    COUPLE_NAMES: [details.brideName, details.groomName].filter(Boolean).join(' & ') || 'Our wedding',
    GUEST_NAME: guestName || 'our dearest friends & family',
    WEDDING_DATE: date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
      : '',
    POSTCARD_IMAGE_URL: emailImage(photo),
    STAMP_IMAGE_URL: emailImage(details.postcardStampUrl || photo, true),
    INVITATION_URL: invitationUrl.href,
  };
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return template.replace(/{{([A-Z_]+)}}/g, (placeholder, key: string) => {
    if (!(key in values)) throw new Error(`Unknown email placeholder: ${placeholder}`);
    return values[key].replace(/[&<>"']/g, character => entities[character]);
  });
}