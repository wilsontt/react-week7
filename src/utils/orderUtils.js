/**
 * 解析訂單是否已付款
 * 支援 API 回傳格式：boolean、字串 "true"/"false"、數字 1/0、巢狀 order.data.is_paid
 * @param {Object} order - 訂單物件
 * @returns {boolean}
 */
export const resolveIsPaid = (order) => {
  const v = order?.is_paid ?? order?.data?.is_paid;
  if (v === true || v === 'true' || v === 1) return true;
  if (v === false || v === 'false' || v === 0) return false;
  return false;
};
