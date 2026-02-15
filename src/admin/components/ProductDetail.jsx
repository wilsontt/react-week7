/* 後台 ProductDetail 產品明細卡片元件

ProductDetail 元件是產品明細卡片元件，用於顯示產品明細資料。

Props:
- product: 產品物件
    包含主圖、標題、分類、描述、內容、價格和副圖的圖片陣列。

Return:
- 產品明細卡片
*/

function ProductDetail({ product }) {
    if (!product) {
        return <p className="text-secondary">請選擇一個商品查看</p>;
    }
    return (
        <>
            <div className="card mb-3 shadow-lg">
                <img
                    src={product.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                />
                <div className="card-body">
                    <h5 className="card-title">
                        {product.title}
                        <span className="badge bg-primary ms-2">
                            {product.category}
                        </span>
                    </h5>
                    <p className="card-text">商品描述：{product.description}</p>
                    <p className="card-text">商品內容：{product.content}</p>
                    <div className="d-flex">
                        <p className="card-text text-secondary">
                            <del>{product.origin_price}</del>
                        </p>
                        元 / {product.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                        {product.imagesUrl?.map((url, index) => (
                            <img key={index} src={url} className="images" />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
};

export default ProductDetail;