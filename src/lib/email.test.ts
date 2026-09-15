import { describe, expect, it } from 'vitest';
import { encodeEmail } from './email';

describe('encodeEmail', () => {
  it('base64-encodes the address', () => {
    expect(encodeEmail('contact@abelazo.photography')).toBe('Y29udGFjdEBhYmVsYXpvLnBob3RvZ3JhcGh5');
  });

  it('round-trips through atob, matching the client-side decode', () => {
    const address = 'contact@abelazo.photography';
    expect(atob(encodeEmail(address))).toBe(address);
  });

  it('never contains "@" in the output', () => {
    expect(encodeEmail('contact@abelazo.photography')).not.toContain('@');
  });
});
