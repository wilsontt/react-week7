import axios from "axios";
import { useState, useEffect } from "react";
import { FaEye, FaStar, FaRegStar, FaList } from "react-icons/fa";

import Pagination from "../components/common/Pagination";
import ProductDetailCard from "../components/common/ProductDetailCard";

// import { createAsynceMessage } from '../slices/messageSlice';
import { setCart } from '../slices/cartSlice';
import { useDispatch } from 'react-redux';


const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;
// console.log(import.meta.env.VITE_API_BASE);

// 取得產品列表的資料
const ProductList = () => {
  // 使用 useDispatch 來發送 Redux 動作
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  // 分頁資料
  const [pagination, setPagination] = useState({});
  // 選取的資品明細資料
  const [selectedProduct, setSelectedProduct] = useState(null)

  // 取得產品列表, 使用 useEffect 來執行. 
  // 使用 async/await 來取得產品資料.
  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE}/api/${VITE_API_PATH}/products?page=${page}`
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      // 切換分頁後捲回列表頂部，避免停在分頁區
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error('取得產品列表錯誤:', error);
    }
  };

  // 元件掛載時取得產品列表資料（setState 僅在非同步回呼中呼叫，避免 cascading renders）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(
          `${VITE_API_BASE}/api/${VITE_API_PATH}/products?page=1`
        );
        if (!cancelled) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
          // console.log('取得產品列表:', response.data.products);  
        }
      } catch (error) {
        if (!cancelled) console.error('取得產品列表錯誤:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** 加入購物車（助教 PDF：POST api/cart） */
  const addCart = async (productId, qty) => {
    const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/cart`;
    try {
      await axios.post(url, { data: { product_id: productId, qty } });
      dispatch(setCart({ carts: [{ product_id: productId, qty }], total: 0, final_total: 0 }));
    } catch (error) {
      console.error('加入購物車失敗:', error);
    }
  };

  // openModal 函數，用於開啟產品明細卡片模態視窗
  // 同一產品連續按時：先清空再設回，強制觸發 null→product 讓 Modal 的 useEffect 再跑一次
  const openModal = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
      setTimeout(() => setSelectedProduct(product), 0);
    } else {
      setSelectedProduct(product);
    }
  };



  return (
    <>
      {/* 利用 JSON.stringify 來顯示 products 的資料 */}
      {/* null, 2 是為了格式化 JSON 字串 */}
      {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}

      <h2 className="text-left mt-2">
        <FaList className="text-warning me-2" size={32} />產品列表</h2>
      <hr />
      {/* 產品列表卡片 */}

      <div className="container text-center">
        {/* 卡片間距：改 row 的 g-2 / g-3 / g-4 / g-5（愈大間距愈寬） */}
        <div className="container row mt-0 g-0">
          {
            products.map((item) => {
              return (
                <div className="col-12 col-md-6 col-lg-4 mt-2" key={item.id}>
                  <div className="card border border-0 text-center">
                    {/* <div className="header">
                      <div className="h4 text-left my-2 border-bottom text-dark">{item.title}</div>
                    </div> */}
                    <div className="card-body d-flex flex-column mb-1" style={{ height: 'auto' }}>
                      <div
                        className="rounded px-3 py-3 mb-0 overflow-hidden text-center"
                        style={{ height: "300px", backgroundColor: "#f8f9fa" }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            className="rounded"
                            alt={item.title}
                          />
                        ) : (
                          <div
                            className="rounded d-flex align-items-center justify-content-center h-100 text-muted small"
                            aria-hidden
                          >
                            無圖片
                          </div>
                        )}
                      </div>
                      <div className="h4 text-left text-dark">
                        {item.title}
                        <small className="fs-6 fw-light bg-secondary text-white px-1 py-0 rounded-pill">{item.category}</small>
                      </div>
                      <div className="mt-0 gap-2">{item.description}</div>
                      <div className="d-flex justify-content-between align-items-left mt-0 gap-2">
                        <div>價格：NT$
                          <small className="text-decoration-line-through">{item.origin_price} </small>
                          <span className="text-danger">{item.price}</span>
                        </div>
                        <div className="col-3 text-left g2">單位：{item.unit}</div>
                        <div className="col-3 text-left g2 d-flex align-items-center gap-1">
                          {/* 用顆星顯示星級 */}
                          {[1, 2, 3, 4, 5].map((i) =>
                            i <= (item.rating ?? 0) ? (
                              <FaStar key={i} className="text-warning" size={18} />
                            ) : (
                              <FaRegStar key={i} className="text-secondary" size={18} />
                            )
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-primary mt-3"
                        onClick={() => openModal(item.id)}
                      >
                        <FaEye className="md-2 text-warning" size={24} />查看明細
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          }
          {/* 分頁元件, 傳入分頁資料及分頁變更事件處理函數 */}
          <Pagination pagination={pagination} onChangePage={(page) => getProducts(page)} />
          {/* 產品明細卡片模態視窗 */}
          <ProductDetailCard
            selectedProduct={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={async (product, qty) => addCart(product.id, qty)}
          />
        </div>
      </div>
    </>
  );
};

export default ProductList;

