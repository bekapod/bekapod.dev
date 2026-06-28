import type { APIRoute } from 'astro';
import { getPublicationUri } from '../../lib/atproto.ts';

export const prerender = true;

export const GET: APIRoute = async () => {
  const uri = await getPublicationUri();
  return new Response(uri, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
