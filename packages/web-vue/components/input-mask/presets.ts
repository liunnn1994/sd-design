import type { InputMaskPresetDefinition, InputMaskPresetName } from './types';

const testPattern = (pattern: RegExp, value: string) => {
  pattern.lastIndex = 0;
  return pattern.test(value);
};

const filterCharacters = (pattern: RegExp) => (value: string) =>
  Array.from(value)
    .filter((character) => testPattern(pattern, character))
    .join('');

const acceptsIpv4 = (value: string) => {
  if (!/^\d*(?:\.\d*){0,3}$/.test(value)) return false;
  return value.split('.').every((part) => part.length <= 3 && (!part || Number(part) <= 255));
};

const acceptsIpv6 = (value: string) => {
  if (!/^[0-9A-Fa-f:]*$/.test(value)) return false;
  if (value.includes(':::')) return false;
  if ((value.match(/::/g) ?? []).length > 1) return false;
  if ((value.match(/:/g) ?? []).length > 7) return false;
  return value.split(':').every((part) => part.length <= 4);
};

const formatDateTimeDigits = (digits: string, dateTimeSeparator: ' ' | 'T') => {
  const value = digits.slice(0, 14);
  let result = value.slice(0, 4);
  if (value.length >= 4) result += '-';
  result += value.slice(4, 6);
  if (value.length >= 6) result += '-';
  result += value.slice(6, 8);
  if (value.length >= 8) result += dateTimeSeparator;
  result += value.slice(8, 10);
  if (value.length >= 10) result += ':';
  result += value.slice(10, 12);
  if (value.length >= 12) result += ':';
  result += value.slice(12, 14);
  return result;
};

const normalizeDateTime = (dateTimeSeparator: ' ' | 'T') => (value: string) => {
  const normalized = filterCharacters(/[0-9TtZz:+\-. ]/)(value);
  const suffix = normalized.slice(19);
  const hasFractionOrTimezone =
    normalized.includes('.') || /[Zz+]/.test(normalized) || suffix.includes('-');
  if (hasFractionOrTimezone) return normalized;
  return formatDateTimeDigits(normalized.replace(/\D/g, ''), dateTimeSeparator);
};

const normalizeIban = (value: string) =>
  filterCharacters(/[A-Za-z0-9]/)(value)
    .toUpperCase()
    .slice(0, 34)
    .replace(/(.{4})(?=.)/g, '$1 ');

const looseUriCharacters = /[^\s]/u;
const urlCharacters = /[A-Za-z0-9:/?#@!$&'()*+,;=._~%\u005B\u005D-]/;

export const inputMaskPresets: Readonly<Record<InputMaskPresetName, InputMaskPresetDefinition>> = {
  'date': {
    placeholder: 'YYYY-MM-DD',
    inputMode: 'numeric',
    mask: '9999-99-99',
  },
  'time': {
    placeholder: 'HH:MM:SS',
    inputMode: 'numeric',
    mask: '99:99:99',
  },
  'datetime': {
    placeholder: '2026-08-06 10:30:00',
    inputMode: 'text',
    normalize: normalizeDateTime(' '),
    accepts: (value) =>
      /^\d{0,4}(?:-\d{0,2}(?:-\d{0,2}(?:[Tt ]\d{0,2}(?::\d{0,2}(?::\d{0,2}(?:\.\d{0,6})?(?:[Zz]|[+-]\d{0,2}(?::\d{0,2})?)?)?)?)?)?)?$/.test(
        value,
      ),
  },
  'rfc3339': {
    placeholder: '2026-08-06T10:30:00+08:00',
    inputMode: 'text',
    // RFC 3339 requires the `T` separator (a bare space is not allowed).
    normalize: normalizeDateTime('T'),
    accepts: (value) =>
      /^\d{0,4}(?:-\d{0,2}(?:-\d{0,2}(?:[Tt]\d{0,2}(?::\d{0,2}(?::\d{0,2}(?:\.\d{0,6})?(?:[Zz]|[+-]\d{0,2}(?::\d{0,2})?)?)?)?)?)?)?$/.test(
        value,
      ),
  },
  'ip': {
    placeholder: '192.168.1.1 或 2001:db8::1',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Fa-f:.]/),
    accepts: (value) => acceptsIpv4(value) || acceptsIpv6(value),
  },
  'ipv4': {
    placeholder: '192.168.1.1',
    inputMode: 'decimal',
    normalize: filterCharacters(/[0-9.]/),
    accepts: acceptsIpv4,
  },
  'ipv6': {
    placeholder: '2001:db8::1',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Fa-f:]/),
    accepts: acceptsIpv6,
  },
  'ip-range': {
    placeholder: '192.168.1.0/24',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Fa-f:./]/),
    accepts: (value) => {
      const slash = value.lastIndexOf('/');
      if (slash === -1) return acceptsIpv4(value) || acceptsIpv6(value);
      const ip = value.slice(0, slash);
      const prefix = value.slice(slash + 1);
      if (!(acceptsIpv4(ip) || acceptsIpv6(ip))) return false;
      if (prefix === '') return true;
      if (!/^\d{0,3}$/.test(prefix)) return false;
      const prefixNum = Number(prefix);
      if (prefixNum > 128) return false;
      if (ip.includes('.') && !ip.includes(':') && prefixNum > 32) return false;
      return true;
    },
  },
  'url': {
    placeholder: 'https://example.com/path',
    inputMode: 'url',
    normalize: filterCharacters(urlCharacters),
    accepts: (value) =>
      /^(?:[A-Za-z][A-Za-z\d+.-]*:\/{0,2})?[A-Za-z0-9:/?#@!$&'()*+,;=._~%\u005B\u005D-]*$/.test(
        value,
      ),
  },
  'email': {
    placeholder: 'name@example.com',
    inputMode: 'email',
    normalize: filterCharacters(looseUriCharacters),
    accepts: (value) => /^[^\s@]*(?:@[^\s@]*)?$/u.test(value),
  },
  'fqdn': {
    placeholder: 'example.com',
    inputMode: 'url',
    normalize: filterCharacters(/[\p{Letter}\p{Number}._*-]/u),
    accepts: (value) => !value.includes('..'),
  },
  'semver': {
    placeholder: '1.2.3-beta.1+build.7',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Za-z.+-]/),
    accepts: (value) =>
      /^(?:0|[1-9]\d*)?(?:\.(?:0|[1-9]\d*)?)?(?:\.(?:0|[1-9]\d*)?)?(?:-[0-9A-Za-z-]*(?:\.[0-9A-Za-z-]*)*)?(?:\+[0-9A-Za-z-]*(?:\.[0-9A-Za-z-]*)*)?$/.test(
        value,
      ),
  },
  'uuid': {
    placeholder: '550e8400-e29b-41d4-a716-446655440000',
    inputMode: 'text',
    mask: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
    formatChars: { h: /[0-9A-Fa-f]/ },
  },
  'mac-address': {
    placeholder: '01:23:45:67:89:ab',
    inputMode: 'text',
    mask: 'hh:hh:hh:hh:hh:hh',
    formatChars: { h: /[0-9A-Fa-f]/ },
  },
  'lat-long': {
    placeholder: '31.2304, 121.4737',
    inputMode: 'text',
    normalize: filterCharacters(/[-0-9+., ]/),
    accepts: (value) => /^[-+]?\d*(?:\.\d*)?(?:, ?[-+]?\d*(?:\.\d*)?)?$/.test(value),
  },
  'hex-color': {
    placeholder: '#1677ff',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Fa-f#]/),
    accepts: (value) => /^#?[0-9A-Fa-f]{0,8}$/.test(value),
  },
  'rgb-color': {
    placeholder: 'rgb(22, 119, 255)',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9a-zA-Z().,% ]/),
    accepts: (value) =>
      /^r(?:g(?:b(?:a)?)?)?\(?(?:\d{0,3}(?:, ?\d{0,3}(?:, ?\d{0,3}(?:, ?(?:\d{0,3}(?:\.\d{0,3})?%?)?)?)?)?)?\)?$/i.test(
        value,
      ),
  },
  'hsl': {
    placeholder: 'hsl(210, 100%, 50%)',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9a-zA-Z().,% ]/),
    accepts: (value) =>
      /^h(?:s(?:l(?:a)?)?)?\(?(?:\d{0,3}(?:, ?\d{0,3}%?(?:, ?\d{0,3}%?(?:, ?(?:\d{0,3}(?:\.\d{0,3})?%?)?)?)?)?)?\)?$/i.test(
        value,
      ),
  },
  'imei': {
    placeholder: '12-345678-901234-5',
    inputMode: 'numeric',
    mask: '99-999999-999999-9',
  },
  'issn': {
    placeholder: '1234-567X',
    inputMode: 'text',
    mask: '9999-999x',
    formatChars: { x: /[0-9Xx]/ },
  },
  'isrc': {
    placeholder: 'US-AAA-26-12345',
    inputMode: 'text',
    mask: 'aa-aaa-99-99999',
  },
  'iso6346': {
    placeholder: 'MSCU 123456 7',
    inputMode: 'text',
    mask: 'aaaa 999999 9',
  },
  'jwt': {
    placeholder: 'header.payload.signature',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Za-z._-]/),
    accepts: (value) => /^[0-9A-Za-z_-]*(?:\.[0-9A-Za-z_-]*){0,2}$/.test(value),
  },
  'mime-type': {
    placeholder: 'application/json',
    inputMode: 'text',
    normalize: filterCharacters(/[0-9A-Za-z!#$&^_.+/-]/),
    accepts: (value) => /^[^/\s]*(?:\/[^/\s]*)?$/.test(value),
  },
  'mailto-uri': {
    placeholder: 'mailto:name@example.com',
    inputMode: 'email',
    normalize: filterCharacters(looseUriCharacters),
    accepts: (value) => /^(?:mailto:?)?[^\s]*$/i.test(value),
  },
  'data-uri': {
    placeholder: 'data:text/plain;base64,...',
    inputMode: 'text',
    normalize: filterCharacters(looseUriCharacters),
    accepts: (value) => /^(?:data:?)?[^\s]*$/i.test(value),
  },
  'magnet-uri': {
    placeholder: 'magnet:?xt=urn:btih:...',
    inputMode: 'text',
    normalize: filterCharacters(looseUriCharacters),
    accepts: (value) => /^(?:magnet:?)?[^\s]*$/i.test(value),
  },
  'iban': {
    placeholder: 'GB82 WEST 1234 5698 7654 32',
    inputMode: 'text',
    normalize: normalizeIban,
    accepts: (value) => /^[A-Z0-9 ]{0,42}$/.test(value),
  },
};
