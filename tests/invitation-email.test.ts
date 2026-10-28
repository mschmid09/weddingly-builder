import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { renderInvitationEmail } from '../src/lib/invitation-email';
import { encodeGuestName } from '../src/lib/utils';

const template = await readFile(new URL('../public/invitation-email.html', import.meta.url), 'utf8');
const details = {
  brideName: 'Jane',
  groomName: 'John',
  weddingDate: new Date('2027-06-19T00:00:00Z'),
  postcardImageUrl: 'https://res.cloudinary.com/wedding/image/upload/v123/postcard.jpg',
  postcardStampUrl: 'https://res.cloudinary.com/wedding/image/upload/v123/stamp.jpg',
  baseUrl: 'https://wedding.example/admin',
};

test('downloaded emails use wedding details, encoded guest links, and small hosted images', () => {
  const guestName = 'Jos\u00e9 & Zo\u00eb';
  const html = renderInvitationEmail(template, { ...details, guestName });
  assert.ok(html.includes('Jane &amp; John'));
  assert.ok(html.includes('Jos\u00e9 &amp; Zo\u00eb'));
  assert.ok(html.includes('June 19, 2027'));
  assert.ok(html.includes(`https://wedding.example/?to=${encodeGuestName(guestName)}`));
  assert.ok(html.includes('/image/upload/c_limit,w_600,q_auto:good,f_jpg/v123/postcard.jpg'));
  assert.ok(html.includes('/image/upload/c_fill,g_auto,w_120,h_152,q_auto:good,f_jpg/v123/stamp.jpg'));
  assert.doesNotMatch(html, /{{[A-Z_]+}}|data:image|<script\b|<iframe\b/i);
  assert.ok(Buffer.byteLength(html) < 15 * 1024);
});

test('downloaded emails safely escape user content and keep a generic option', () => {
  const html = renderInvitationEmail(template, { ...details, brideName: '<script>alert("hi")</script>', guestName: '<img src=x onerror="alert(1)">' });
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  assert.doesNotMatch(html, /<script\b|<img src=x/i);
  const generic = renderInvitationEmail(template, { baseUrl: details.baseUrl });
  assert.ok(generic.includes('Dear our dearest friends &amp; family,'));
  assert.ok(generic.includes('href="https://wedding.example/"'));
  assert.doesNotMatch(generic, /\?to=|Invalid Date|undefined|src=""/);
});

test('email exports reject embedded image data and unsafe image protocols', () => {
  for (const postcardImageUrl of ['data:image/png;base64,abc', 'javascript:alert(1)']) {
    assert.throws(() => renderInvitationEmail(template, { ...details, postcardImageUrl }), /hosted HTTP or HTTPS/);
  }
});

test('postcard email uses two desktop columns with a mobile stacking layout', () => {
  assert.equal((template.match(/class="postcard-column /g) || []).length, 2);
  assert.match(template, /@media only screen and \(max-width: 600px\)/);
  assert.match(template, /\.postcard-column\s*\{[^}]*display: block !important;[^}]*width: 100% !important;/);
  assert.match(template, /width="800"/);
  assert.equal((template.match(/<img\b/g) || []).length, 2);
  for (const tag of ['table', 'tr', 'td']) {
    assert.equal((template.match(new RegExp(`<${tag}\\b`, 'g')) || []).length, (template.match(new RegExp(`</${tag}>`, 'g')) || []).length);
  }
});