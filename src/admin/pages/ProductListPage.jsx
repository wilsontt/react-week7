import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { createAsynceMessage } from '../../slices/messageSlice';
import { useDispatch } from 'react-redux';

// 共用元件
import ProductTable from '../components/ProductTable';
import ProductDetail from '../components/ProductDetail';
import Pagination from '../components/Pagination';
import { FaEye } from 'react-icons/fa';

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(undefined);

  // 使用 useDispatch 來發送 Redux 動作
  const dispatch = useDispatch();

  // 分頁資料
  const [pagination, setPagination] = useState({});

  // 取得產品資料
  const getProducts = useCallback(async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(response.data.products);
      // 取得資料後，設定分頁資料。
      setPagination(response.data.pagination);
      // console.log(response.data);
    } catch (error) {
      console.error('取得產品資料失敗', error);
      dispatch(createAsynceMessage(error.response?.data));
    }
  }, [dispatch]);

  // 元件掛載時取得資料
  useEffect(() => {
    const token = document.cookie
      .split(';')
      .find((row) => row.startsWith('hexToken='))
      ?.split('=')[1];
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    void (async () => {
      await getProducts();
    })();
  }, [getProducts]);
    
    // 定義 產品列表的表格欄位 及 自訂渲染函數：
    //  key: 產品物件的屬性名稱, 例如 'category', 'title', 'origin_price', 'price', 'is_enabled'
    //  label: 欄位標題, 例如 '分類', '產品名稱', '原價', '售價', '是否啟用'
    //  className: CSS 類別名稱（可選）, 例如 'text-left', 'text-center', 'text-right'  
    //  render: 自訂渲染函數（可選）
    const columns = [
      { key: 'title',        label: '產品名稱',  className: 'text-left' },
      { key: 'origin_price', label: '原價',     className: 'text-center' },
      { key: 'price',        label: '售價',     className: 'text-center' },
      {
        key: 'rating', label: '評分', className: 'text-center',
        render: (item) => (
          <span className="text-warning">
            {item.rating} 顆星
          </span>
        ),
      },
        {
            key: 'is_enabled',
            label: '是否啟用',
            className: 'text-center',
            render: (item) => (
                <span className={`${item.is_enabled ? 'text-success' : 'text-danger'}`}>
                    {item.is_enabled === 1 ? '啟用' : '未啟用'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '查看細節',
            className: 'text-center',
            render: (item) => (
                <button 
                    type="button" 
                    className="btn btn-outline-primary" 
                    onClick={() => setTempProduct(item)}
                >
                    <FaEye className='md-2' size={14} />查看細節
                    </button>
            ),
        },
    ];

    return (
      <>
        <div className="row container-fluid">
          {/* 左側產品列表 */}
          <div className="col-md-6">
            <h2>產品列表</h2>
          {/* 優化 ProductTable 元件，將產品列表功能，封裝成 ProductTable 元件，並在 ProductListPage 中使用。 */}
            <ProductTable products={products} columns={columns} />
          </div>

          {/* 右側產品明細卡片 */}
          <div className="col-md-6">
            <h2>{tempProduct ? `${tempProduct.title} 的產品明細` : '單一產品明細'}</h2>
            {/* 優化 ProductDetail 元件，將產品明細功能，封裝成 ProductDetail 元件，並在 ProductListPage 中使用。 */}
            <ProductDetail product={tempProduct} />
          </div>
        </div>
        <Pagination pagination={pagination} onChangePage={getProducts} />
      </>
  );


};

export default ProductListPage;
