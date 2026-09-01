export const flag = /[gimsuy]/;
export const cX = /^([A-Z])/i;
export const xhh = /^([0-9A-F]{2})/i;
export const uhhhh = /^([0-9A-F]{4})/i;
export const digit = /^(\d+)/;
export const comma = /^,/;
export const lookAround = /^(\?=|\?!|\?<=|\?<!)/;
export const nonCapturing = /^\?:/;
const unicodeEscape = String.raw`\\u(?:[0-9A-Fa-f]{4}|\{[0-9A-Fa-f]{1,6}\})`;
const groupNameStart = String.raw`(?:[$_\p{ID_Start}]|${unicodeEscape})`;
const groupNameContinue = String.raw`(?:[$\u200C\u200D\p{ID_Continue}]|${unicodeEscape})`;
const groupName = `${groupNameStart}${groupNameContinue}*`;

export const namedCapturing = new RegExp(`^\\?<(${groupName})>`, 'u');
export const quantifier = /^\{(\d+)(,|,(\d+))?\}/;
export const specialCharacter = /[()[|\\.^$?+*]|\{(\d+)(,|,(\d+))?\}/;
export const characterClass = /^\\(?:[dDwWsStrnvf0]|c[A-Za-z]|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4})/;
export const unicodeCodePoint = /^\\u\{[0-9A-Fa-f]{1,6}\}/;
export const unicodeProperty = /^\\[pP]\{[^}]+\}/;
export const backReference = new RegExp(`^\\\\(\\d+|k<(${groupName})>)`, 'u');
export const escapeSequences =
  /^\\(?:[0nrtbfv]|u[0-9A-Fa-f]{4}|x[0-9A-Fa-f]{2}|u\{[0-9A-Fa-f]{1,6}\})/;
