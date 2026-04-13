export function convertToUpperCamelCase(str) {
  let words = str.split('-');
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return words.join('');
}

/**
 * 执行异步函数并添加超时取消功能
 * @param {Function} asyncFunc - 要执行的异步函数
 * @param {number} timeoutMs - 超时时间(毫秒)
 * @param {...unknown[]} args - 传递给异步函数的参数
 * @returns {Promise} - 返回异步函数的结果或超时 reject
 */
export async function asyncWithTimeout(asyncFunc, timeoutMs, ...args) {
  // 创建超时Promise
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(`操作超时（${timeoutMs}ms）`));
    }, timeoutMs);
  });

  // 执行目标函数
  const funcPromise = asyncFunc.apply(this, args);

  // 竞争执行
  return Promise.race([funcPromise, timeoutPromise]);
}
