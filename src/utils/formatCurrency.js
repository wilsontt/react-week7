/**
 * 將數字格式化為含千位數符號的金額字串
 * @param {number|string} value - 金額
 * @returns {string} 例如 1234567 → "1,234,567"
 */
export const formatCurrency = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('zh-TW');
};
