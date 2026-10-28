import type { Prisma, PrismaClient } from '@prisma/client';
import type { WeddingSite, WeddingSiteFormData } from './validations';

export async function getWeddingVersions(prisma: PrismaClient, userId: string) {
  const site = await prisma.weddingSite.findUnique({
    where: { userId },
    include: {
      events: { orderBy: { order: 'asc' } },
      versions: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
    },
  });
  if (!site) return { weddingSite: null, versions: [] as WeddingSite[] };

  const versions = site.versions.map((version, index) => ({
    ...(version.data as Record<string, unknown>),
    id: site.id,
    userId: site.userId,
    versionId: version.id,
    versionNumber: index + 1,
    isPublished: site.isPublished && site.publishedVersionId === version.id,
    createdAt: site.createdAt,
    updatedAt: version.createdAt,
  } as unknown as WeddingSite)).reverse();
  return { weddingSite: versions[0] || site, versions };
}

export async function saveWeddingVersion(prisma: PrismaClient, userId: string, data: WeddingSiteFormData) {
  const versionId = await prisma.$transaction(async transaction => {
    const { events, isPublished = false, slug, ...content } = data;
    const eventData = events.map((event, order) => ({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      address: event.address,
      order,
    }));
    let site = await transaction.weddingSite.findUnique({ where: { userId } });
    if (!site) {
      site = await transaction.weddingSite.create({
        data: {
          ...content,
          userId,
          slug: slug || `wedding-${crypto.randomUUID()}`,
          isPublished: false,
          events: { create: eventData },
        },
      });
    }
    const versionSlug = slug || site.slug;
    const snapshot = JSON.parse(JSON.stringify({ ...content, slug: versionSlug, events: eventData })) as Prisma.InputJsonValue;
    const version = await transaction.weddingVersion.create({
      data: { siteId: site.id, data: snapshot },
    });
    if (isPublished) {
      await transaction.weddingSite.update({
        where: { id: site.id },
        data: {
          ...content,
          slug: versionSlug,
          isPublished: true,
          publishedVersionId: version.id,
          events: { deleteMany: {}, create: eventData },
        },
      });
    }
    return version.id;
  });
  const result = await getWeddingVersions(prisma, userId);
  return { ...result, weddingSite: result.versions.find(version => version.versionId === versionId)! };
}