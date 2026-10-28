import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeGuestName, decodeGuestName } from '../src/lib/utils';

test('guest names round-trip through URL-safe Base64 and query parameters', () => {
  for (const name of ['Jane Doe', '  Jane Doe  ', 'Jos\u00e9 & Zo\u00eb', '\u674e\u96f7', '\u{1f48c}', '100% invited', '']) {
    const encoded = encodeGuestName(name);
    assert.match(encoded, /^[A-Za-z0-9_-]*$/);
    const url = new URL(`https://example.com/?to=${encoded}`);
    assert.equal(decodeGuestName(url.searchParams.get('to')!), name.trim());
  }
  assert.equal(encodeGuestName('Jane Doe'), 'SmFuZSBEb2U');
});

test('legacy names and malformed encoded names do not break invitations', () => {
  for (const value of ['Jane Doe', 'Jane', '100% invited', '%%%broken', '_w', 'AA']) {
    assert.equal(decodeGuestName(value), value);
  }
});