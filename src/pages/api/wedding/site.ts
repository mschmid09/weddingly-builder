import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { z } from 'zod';
import { eventSchema, weddingSiteSchema } from '../../../lib/validations';
import { getWeddingVersions, saveWeddingVersion } from '../../../lib/wedding-versions';

const versionSchema = weddingSiteSchema.extend({
  weddingDate: z.coerce.date().nullable().optional(),
  events: z.array(eventSchema.extend({ date: z.coerce.date() })),
});

export const GET: APIRoute = async (context) => {
  try {
    const session = await requireAuth(context);

    const result = await getWeddingVersions(prisma, session.userId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unauthorized';
    return new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireAuth(context);
    const data = versionSchema.parse(await context.request.json());
    const result = await saveWeddingVersion(prisma, session.userId, data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Please check the wedding details.', issues: error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to save wedding site';
    console.error('Wedding site save error:', error);
    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: message === 'Unauthorized' ? 401 : 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
