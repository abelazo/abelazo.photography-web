/**
 * Base64-encodes the contact email so the built HTML never contains the
 * plain address — it's decoded client-side by ObfuscatedEmail.astro. This
 * only deters naive regex/HTML scrapers, not headless-browser crawlers, but
 * that covers the bulk of email-harvesting spam.
 */
export function encodeEmail(address: string): string {
  return Buffer.from(address, 'utf-8').toString('base64');
}
