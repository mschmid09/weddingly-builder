import 'dotenv/config';
import assert from 'node:assert/strict';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';
import { getWeddingVersions, saveWeddingVersion } from '../src/lib/wedding-versions';
import { weddingSiteSchema } from '../src/lib/validations';
import { weddingSiteService } from '../src/lib/api';

test('saving versions preserves existing content, the published wedding, ownership, and RSVPs', { skip: !process.env.DATABASE_URL }, async () => {
  const prisma = new PrismaClient();
  const suffix = crypto.randomUUID();
  const user = await prisma.user.create({ data: { email: `versions-${suffix}@example.invalid`, password: suffix } });
  try {
    const content = weddingSiteSchema.parse({
      primaryColor: '#e4b6c6', secondaryColor: '#d4a5a5', accentColor: '#9b7e7e',
      headingFont: 'Playfair Display', bodyFont: 'Lato', heroEnabled: true,
      brideName: 'Original name', groomName: 'Partner', weddingDate: new Date('2027-06-19'),
      postcardImageUrl: 'https://example.com/photo.jpg', postcardStampUrl: 'https://example.com/stamp.jpg',
      storyEnabled: true, storyTitle: 'Our Story', storyText: 'Keep our existing story.',
      galleryEnabled: false, galleryTitle: 'Gallery', galleryImages: ['https://example.com/gallery.jpg'],
      registryEnabled: true, registryTitle: 'Registry', registryText: 'Keep our registry.',
      slug: `versions-${suffix}`, password: '',
      events: [{ title: 'Ceremony', date: new Date('2027-06-19'), time: '15:00', location: 'Garden', address: 'Garden Road', order: 0 }],
    });
    assert.equal((await getWeddingVersions(prisma, user.id)).weddingSite, null);
    const first = await saveWeddingVersion(prisma, user.id, { ...content, isPublished: false });
    assert.equal(first.weddingSite.versionNumber, 1);
    assert.equal(first.weddingSite.storyText, content.storyText);
    const published = await saveWeddingVersion(prisma, user.id, { ...content, brideName: 'Published name', isPublished: true });
    const siteId = published.weddingSite.id;
    await prisma.rSVP.create({ data: { siteId, fullName: 'Guest', attending: true } });
    const draft = await saveWeddingVersion(prisma, user.id, { ...content, brideName: 'Draft name', events: [], isPublished: false });
    assert.equal(draft.weddingSite.id, siteId);
    assert.equal(draft.weddingSite.brideName, 'Draft name');
    assert.equal(draft.versions.length, 3);
    assert.equal(draft.versions.find(version => version.versionNumber === 1)?.brideName, 'Original name');
    assert.equal(draft.versions.find(version => version.isPublished)?.versionId, published.weddingSite.versionId);
    const live = await prisma.weddingSite.findUniqueOrThrow({ where: { id: siteId }, include: { events: true, rsvps: true } });
    assert.equal(live.brideName, 'Published name');
    assert.equal(live.events.length, 1);
    assert.equal(live.rsvps.length, 1);
    assert.equal(await prisma.weddingSite.count({ where: { userId: user.id } }), 1);
    assert.equal((await getWeddingVersions(prisma, `other-${suffix}`)).versions.length, 0);
    const restored = await saveWeddingVersion(prisma, user.id, { ...content, isPublished: true });
    assert.equal(restored.weddingSite.versionNumber, 4);
    assert.equal(restored.weddingSite.id, siteId);
    assert.equal(restored.versions.filter(version => version.isPublished).length, 1);
    assert.equal(restored.versions.find(version => version.versionNumber === 2)?.brideName, 'Published name');
    assert.equal(await prisma.rSVP.count({ where: { siteId } }), 1);
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
});

test('saving a cleared wedding date sends null rather than omitting the field', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, options) => {
    const data = JSON.parse(options?.body as string);
    assert.equal(data.weddingDate, null);
    return new Response(JSON.stringify({ weddingSite: {}, versions: [] }), { status: 200 });
  };
  try {
    await weddingSiteService.save({ weddingDate: null, events: [] } as Parameters<typeof weddingSiteService.save>[0]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});