export const toKebabCase = (value) => {
  return value.replace(/[A-Z]+/g, (match, offset) => {
    return `${offset > 0 ? '-' : ''}${match.toLowerCase()}`;
  });
};

export const toPascalCase = (value) => {
  return value
    .replace(/^./, (match) => match.toUpperCase())
    .replace(/-(.)/g, (_, letter) => letter.toUpperCase());
};
