// src/routes/logout/+server.js
import { redirect } from '@sveltejs/kit';

export function GET() {
  throw redirect(302, '/');
}