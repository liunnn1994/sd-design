export function padStart(string: string | number, length: number, char = ' '): string {
  return String(string).padStart(length, char);
}
