// Align decimal digits and add column by column without converting whole values to Number.
export function addDecimal(value: string, step: number, subtract: boolean): string {
  const parts = (text: string) => {
    const [coefficient, exponent = '0'] = text.toLowerCase().split('e');
    const [integer, fraction = ''] = coefficient.split('.');
    const scale = fraction.length - Number(exponent);
    return {
      digits: `${integer}${fraction}`.replace(/^[+-]/, '') + '0'.repeat(Math.max(0, -scale)),
      negative: text.startsWith('-'),
      scale: Math.max(0, scale),
    };
  };
  let left = parts(value);
  let right = parts(String(step));
  right.negative = right.negative !== subtract;
  const scale = Math.max(left.scale, right.scale);
  for (const part of [left, right]) {
    part.digits = (part.digits + '0'.repeat(scale - part.scale)).replace(/^0+/, '') || '0';
  }
  const adding = left.negative === right.negative;
  if (
    !adding &&
    (left.digits.length < right.digits.length ||
      (left.digits.length === right.digits.length && left.digits < right.digits))
  ) {
    [left, right] = [right, left];
  }
  let digits = '';
  let carry = 0;
  for (let index = 1; index <= Math.max(left.digits.length, right.digits.length); index++) {
    const a = Number(left.digits[left.digits.length - index] ?? 0);
    const b = Number(right.digits[right.digits.length - index] ?? 0);
    const total = a + (adding ? b : -b) + carry;
    carry = Math.floor(total / 10);
    digits = String((total + 10) % 10) + digits;
  }
  if (carry > 0) digits = String(carry) + digits;
  digits = (digits.replace(/^0+/, '') || '0').padStart(scale + 1, '0');
  const sign = left.negative && /[1-9]/.test(digits) ? '-' : '';
  return scale ? `${sign}${digits.slice(0, -scale)}.${digits.slice(-scale)}` : `${sign}${digits}`;
}
