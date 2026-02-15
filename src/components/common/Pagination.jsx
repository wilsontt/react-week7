/* 
分頁元件：用於分頁顯示，包含上一頁、下一頁、跳頁、總頁數、當前頁數、總筆數等。
傳入參數：pagination、onChangePage：分頁變更事件處理函數
*/

function Pagination({ pagination, onChangePage}) {

    // 分頁變更事件處理函數，關閉預設行為。
    const handlePageClick = (e, page) => {
        e.preventDefault();
        onChangePage(page);
    };

    return (
        <nav aria-label="分頁導覽">
            {/* 測試用：顯示分頁資料 */}
            {/* {JSON.stringify(pagination)} */}

            <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.has_pre ? '' : 'disabled'}`}>
                    <a className="page-link" href="#" aria-label="Previous"
                        onClick={(e) => handlePageClick(e, pagination.current_page - 1)}>
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                {/* 從API取得總頁數，利用Array.from() 生成頁頁列表。*/}
                {
                    Array.from({length: pagination.total_pages}, (_, index) => (
                        <li className={`page-item ${pagination.current_page === index +1 && 'active'}`} 
                            key={`${index}_page`}>
                            <a className="page-link" href="#"
                                onClick={(e) => handlePageClick(e, index + 1)}>
                                {index + 1}
                            </a>
                        </li>
                    ))
                }
                <li className={`page-item ${!pagination.has_next && 'disabled'}`}>
                    <a className="page-link" href="#" aria-label="Next"
                        onClick={(e) => handlePageClick(e, pagination.current_page + 1)}>
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination;