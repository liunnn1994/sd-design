module.exports = {
  reject: ['@types/node'],
  target: (name) => {
    if (name === 'vite') {
      return 'minor';
    }
    return 'latest';
  },
};
