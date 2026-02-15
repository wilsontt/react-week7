/* 產品列表表格元件

ProductTable 元件是產品列表表格元件，用於顯示產品列表資料。

Props:
- products: 產品列表資料陣列
- columns: 表格欄位陣列，每個欄位包含 { key, label, className, render }，render 是自訂渲染函數，用於渲染欄位內容。

Return:
- 產品列表表格
*/


function ProductTable({ products, columns, onRowClick}) {
    return (
        <>
            <table className="table">
                {/* 表格標題列 */}
                <thead>
                    <tr className="table-info">
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                {/* 表格內容列 */}
                <tbody className="align-middle">
                    {products.map((item) => (
                        <tr key={item.id} onClick={() => onRowClick && onRowClick(item)}>
                            {columns.map((col) => (
                                <td key={col.key} className={col.className || ''}>
                                    {/* 自訂渲染函數，用於渲染欄位內容, 如果沒有自訂渲染函數，則顯示欄位內容。 */}
                                    {col.render ? col.render(item) : item[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}



export default ProductTable;