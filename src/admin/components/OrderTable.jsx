/**
 * 訂單列表表格元件
 *
 * 僅負責渲染表格，只接收 orders 與 columns。
 * 詳情（收件人 EMAIL、電話、地址等）由父層 Modal 顯示。
 *
 * @param {Array} orders - 訂單列表
 * @param {Array} columns - 欄位定義 { key, label, className?, render? }
 */
function OrderTable({ orders = [], columns = [] }) {
  return (
    <table className="table table-bordered">
      <thead>
        <tr className="table-info">
          {(columns ?? []).map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="align-middle">
        {(orders ?? []).map((order) => (
          <tr key={order.id}>
            {(columns ?? []).map((col) => (
              <td key={col.key} className={col.className || ''}>
                {/* 自訂渲染函數，用於渲染欄位內容, 如果沒有自訂渲染函數，則顯示欄位內容。 */}
                {col.render ? col.render(order) : order[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OrderTable;