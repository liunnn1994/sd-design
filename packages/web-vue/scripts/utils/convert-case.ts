export const toKebabCase = (value: string) => {
  return value.replace(/[A-Z]+/g, (match, offset) => {
    return `${offset > 0 ? '-' : ''}${match.toLowerCase()}`;
  });
};

export const toPascalCase = (value: string) => {
  return value
    .replace(/^./, (match) => match.toUpperCase())
    .replace(/-(.)/g, (_, letter) => letter.toUpperCase());
};
