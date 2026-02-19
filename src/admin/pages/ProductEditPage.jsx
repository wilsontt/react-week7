import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import Pagination from '../components/Pagination';
import { FaEdit, FaTrash } from 'react-icons/fa';
// import ProductDetail from '../components/ProductDetail';

import { createAsyncMessage } from '../../slices/messageSlice';
import { useDispatch } from 'react-redux';
import { formatCurrency } from '../../utils/formatCurrency';

import * as bootstrap from 'bootstrap'
import "../assets/style.css"

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;


// 建立初始化的產品資料物件
const INITIAL_TEMPLATE_DATA = {
    id: "",
    title: "",
    category: "",
    origin_price: "",
    price: "",
    unit: "",
    description: "",
    content: "",
    rating: 0,
    is_enabled: false,
    imageUrl: "",
    imagesUrl: [],
};


const ProductEditPage = () => {
    // 使用 useRef 建立綁定 DOM 元素
    const productModalRef = useRef(null);
    // 使用 useRef 儲存 Bootstrap Modal 實例
    const modalInstanceRef = useRef(null);

    // 建立表單資料模板
    const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
    const [modalType, setModalType] = useState(""); // create: 新增, edit: 編輯, delete: 刪除

    // 分頁資料
    const [pagination, setPagination] = useState({});

    // 使用 useDispatch 來發送 Redux 動作
    const dispatch = useDispatch();

    // 取得產品資料
    const [products, setProducts] = useState([]);
    const getProducts = useCallback(async (page = 1) => {
        try {
            const response = await axios.get(
                `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
            );
            setProducts(response.data?.products ?? []);
            // 取得資料後，設定分頁資料。
            setPagination(response.data?.pagination ?? {});
            // console.log(response.data);
        } catch (error) {
            console.log('取得產品資料失敗', error.response);
            // 加入失敗的 Alert 提示。
            dispatch(createAsyncMessage(error.response?.data));
        }
    }, [dispatch]);
    
    // 畫面渲染完後執行：元件掛載後，取得資料並設定 Bootstrap Modal 元件的參數。
  useEffect(() => {
        const token = document.cookie 
            .split(';')
            .find((row) => row.startsWith('hexToken='))
            ?.split('=')[1];
        if (token) {
          axios.defaults.headers.common.Authorization = token;
        }
        // 避免在 effect 本體「同步」觸發 setState。
        void (async () => {
            await getProducts();
        })();
        
        // 初始化 Bootstrap Modal
        if (productModalRef.current) {
            modalInstanceRef.current = new bootstrap.Modal(productModalRef.current, {
                keyboard: false
            });
        }

        // Modal關閉時移除焦點
        const modalElement = document.querySelector("#productModal");
        if (modalElement) {
            modalElement.addEventListener('hide.bs.modal', () => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            });
        }
    }, [getProducts]);
    
    // open Modal 
    const openModal = (type, product) => {
        // 取得單筆產品資料在 Modal 元件中，並在主控台中顯示該筆資料。
        // console.log('操作類型：', type);
        // console.log('被選中的產品資料：', product);
        // 設定然後綁定至 Modal 表單元件中。
        setModalType(type);
        if (product) {
            const rawImages = (product.imagesUrl || []).filter(Boolean);
            const mainImage = product.imageUrl || rawImages[0] || "";
            const subImages = product.imageUrl ? rawImages : rawImages.slice(1);

            setTemplateData({
                ...product,
                imageUrl: mainImage,
                imagesUrl: subImages.length > 0 ? subImages : [''],
            });
        } else {
            // 新增時，確保 imagesUrl 至少有一個空字串，方便使用者輸入
            setTemplateData({
                ...INITIAL_TEMPLATE_DATA,
                imagesUrl: [''],
            });
        }
        // 使用 ref 顯示 Modal 表單元件。
        if (modalInstanceRef.current) {
            modalInstanceRef.current.show();
        }
    };

    // close Modal
    const closeModal = () => {
        if (modalInstanceRef.current) {
            modalInstanceRef.current.hide();
        }
    };

    // 在 Model 表單中編輯，輸入資料時，更新 templateData 的資料。
    const handleModalInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        // 簡化 checked 判斷，由 setTemplateData 中直接判斷。
        // const checked = type === 'checkbox' ? e.target.checked : undefined;
        
        // console.log(name, value, checked, type);
        // 使用 setState 更新 templateData 的資料。
        setTemplateData((preData) => ({
            ...preData,    // 使用解構賦值方式，保留之前的資料。
            [name]: type === 'checkbox' ? checked : value, // 使用三元運算子，更新指定的欄位。
        }));
    };

    const countTotalImages = (data) => {
        const subCount = data.imagesUrl.filter((url) => url).length;
        return 1 + subCount;
    };

    // 上傳圖片檔案，限制SIZE <= 3MB. 且格式為 jpg, jpeg, png。
    const handleModalImageFileUpload = async (e) => {
        // 取得檔案
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        // check file size <= 3MB.
        if (file.size > 3 * 1024 * 1024) {
            alert('圖片大小不能超過3MB');
            return;
        }
        // check file format jpg, jpeg, png.
        if (!file.type.includes('image/')) {
            alert('圖片格式不正確，圖片只能上傳：jpg, jpeg, png 格式。');
            return;
        }
        // 上傳圖片，並取得圖片網址。
        const formData = new FormData();
        formData.append('file-to-upload', file);
        try {
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData);
            // console.log(response.data);
            // 上傳圖片成功後，更新 templateData 的資料。
            setTemplateData((pre) => {
                const uploadedUrl = response.data.imageUrl;
                if (!uploadedUrl) {
                    return pre;
                }
                const totalCount = countTotalImages(pre);
                if (!pre.imageUrl) {
                    return {
                        ...pre,
                        imageUrl: uploadedUrl,
                    };
                }
                if (totalCount >= 5) {
                    alert('圖片總數已達上限 5 張');
                    return pre;
                }
                const newImages = [...pre.imagesUrl];
                const emptyIndex = newImages.findIndex((url) => !url);
                if (emptyIndex !== -1) {
                    newImages[emptyIndex] = uploadedUrl;
                } else {
                    newImages.push(uploadedUrl);
                }
                return {
                    ...pre,
                    imagesUrl: newImages,
                };
            });
        } catch (error) {
            console.error('上傳圖片失敗: ', error);
        }
    }

    // 編輯限制圖片數量最多5張，最少1張，且最後一張不能空白。
    const handleModalImageChange = (index, value) => {
        setTemplateData((pre) => {
            const newImages = [...pre.imagesUrl];
            newImages[index] = value;

            // 優化 handleModalImageChange
            // 限制圖片最多只能5張，且最後一張不能空白。
            const totalCount = countTotalImages({
                ...pre,
                imagesUrl: newImages,
            });
            const hasEmptySlot = newImages.some((url) => !url);
            if (value !== "" && index === newImages.length - 1 && totalCount < 5 && !hasEmptySlot) {
                newImages.push(""); // 滿足上述 if 條件，自動新增一個空的Input輸入框。
            }

            // 限制圖片最少要1張，且最後一張不能空白。
            if (value ==="" && newImages.length > 1 && newImages[newImages.length-1] === "") {
                newImages.pop(); // 滿足上述 if 條件，自動刪除最後一個空的Input輸入框。
            }
            return {
                ...pre,
                imagesUrl: newImages,
            }; 
        });
    };

    // 編輯圖片-新增圖片
    const handleAddImage = () => {
        setTemplateData((pre) => { 
            const totalCount = countTotalImages(pre);
            if (totalCount >= 5) {
                alert('圖片總數已達上限 5 張');
                return pre;
            }
            const lastSubImage = pre.imagesUrl[pre.imagesUrl.length - 1] || "";
            if (lastSubImage === "") {
                alert('請先填寫上一張圖片網址');
                return pre;
            }
            const newImage = [...pre.imagesUrl];
            newImage.push(""); // 滿足上述 if 條件，自動新增一個空的Input輸入框。
            return {
                ...pre,
                imagesUrl: newImage,
            }
        });
    };
    
    // 編輯圖片-刪除圖片
    const handleRemoveImage = () => {
        setTemplateData((pre) => {
            const newImage = [...pre.imagesUrl];
            newImage.pop();
            return {
                ...pre, 
                imagesUrl: newImage,
            };
        });
    };       

    // 建立 axios 要接收的資料格式。
    const productData = {
        data: {
            ...templateData, // 使用解構賦值方式，保留之前的資料。
            origin_price: Number(templateData.origin_price),
            price: Number(templateData.price),
            is_enabled: templateData.is_enabled ? 1 : 0,
            imagesUrl: templateData.imagesUrl.filter(url => url !== ""),  // 過濾掉空的圖片網址。
            rating: Number(templateData.rating), // 將評分轉換為數字。
        }
    }

    // 儲存產品資料
    const updateProduct = async (id) => {
        // 新增 / 編輯 共用同一個表單，由 modalType 判斷是新增還是編輯。
        let url = `${API_BASE}/api/${API_PATH}/admin/product`;
        let method = "post"; // 預設為新增。
        if (modalType === "edit") {
            url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
            method = "put";
        }
        try {
            // 根據 method 決定使用 post 或 put
            const _response = method === "post" 
                ? await axios.post(url, productData)
                : await axios.put(url, productData);
            // console.log('儲存產品資料成功: ', response.data);
            // 加入成功的 Alert 提示。
            const successMsg = modalType === "edit" 
                ? "編輯產品資料成功"
                : "新增產品資料成功";
            // alert(successMsg);
            dispatch(createAsyncMessage({
              success: true,
              message: successMsg,
            }))

            getProducts(pagination.current_page);
            closeModal();
        } catch (error) {
            console.error('儲存產品資料失敗: ', error);
            // 加入 失敗的 Alert 提示。
            const errorMsg = error.response?.data?.message
                || error.message
                || '資料儲存失敗，請檢查輸入資料';
            // alert(`儲存失敗：${errorMsg}`);
            dispatch(createAsyncMessage({
              success: false,
              message: `儲存失敗：${errorMsg}`,
            }))
        }
    }

    // 刪除產品
    const deleteProduct = async (id) => {
        try {
            const _response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
            // console.log('刪除產品', response.data);
            alert('刪除產品成功');

            // 關閉 Modal 表單元件, 然後重新載入產品。
            closeModal();
            getProducts();
        } catch (err) {
            console.log('刪除產品失敗: ', err);
            const errorMsg = err.response?.data?.message 
                || err.message
                || '刪除失敗，請稍後再試。';
            // alert(`刪除產品失敗： ${errorMsg}`);
            dispatch(createAsyncMessage({
              success: false,
              message: `刪除產品失敗： ${errorMsg}`,
            }))
        }
    };
    
    // 定義 產品列表的表格欄位 及 自訂渲染函數：
    //  key: 產品物件的屬性名稱, 例如 'category', 'title', 'origin_price', 'price', 'is_enabled'
    //  label: 欄位標題, 例如 '分類', '產品名稱', '原價', '售價', '是否啟用'
    //  className: CSS 類別名稱（可選）, 例如 'text-left', 'text-center', 'text-right'  
    //  render: 自訂渲染函數（可選）
    const columns = [
        { key: 'category',     label: '分類',     className: 'text-left' },
        { key: 'title',        label: '產品名稱',  className: 'text-left' },
        {
            key: 'origin_price',
            label: '原價',
            className: 'text-center',
            render: (item) => formatCurrency(item.origin_price ?? 0),
        },
        {
            key: 'price',
            label: '售價',
            className: 'text-center',
            render: (item) => formatCurrency(item.price ?? 0),
        },
        { key: 'rating',       label: '評分',     className: 'text-center', 
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
        // 產品明細
        // {
        //     key: 'actions',
        //     label: '查看細節',
        //     className: 'text-center',
        //     render: (item) => (
        //         <button
        //             type="button"
        //             className="btn btn-outline-primary"
        //             onClick={() => setTempProduct(item)}
        //         >
        //             <FaEye className='md-2' size={14} />查看細節
        //         </button>
        //     ),
        // },
        {
            key: 'actions',
            label: '操作',
            className: 'text-center',
            render: (item) => (
                <div 
                    className="btn-group" 
                    role="group" 
                    aria-label="Basic outlined example"
                >
                    <button 
                        type="button" 
                        className="btn btn-outline-warning" 
                        onClick={() => openModal('edit', item)}
                    >
                        <FaEdit className='me-2' size={14} />編輯
                        </button>
                    <button 
                        type="button" 
                        className="btn btn-outline-danger" 
                        onClick={() => openModal('delete', item)}
                    >
                        <FaTrash className='md-2' size={14} />刪除
                        </button>
                </div>
            ),
        },
    ];

    // 優化 ProductTable 元件，將產品列表功能，封裝成 ProductTable 元件，並在 ProductEditPage 中使用。
    return (
        <>
            <div className="container-sm">
                {/* 這裡放置產品列表的頁面 含 建立、編輯、刪除 的按鈕 */}
                <div className="row w-100">
                    <div className="col-md-6 text-start">
                        <h4>產品編輯/管理列表</h4>
                    </div>
                    <div className="col-md-6 text-end">
                        <button type="button" className="btn btn-primary"
                            // onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
                            onClick={() => openModal("create", null)}
                        >
                            建立新的產品
                        </button>
                    </div>
                </div>
                {/* 將 ProductEditPage 的產品列表功能，封裝成 ProductTable 元件，並在 ProductEditPage 中使用。 */}
                <ProductTable products={products} columns={columns} />
                {/* 分頁元件, 傳入分頁資料及分頁變更事件處理函數 */}
                <Pagination pagination={pagination} onChangePage={getProducts} />
            </div>

            {/* 右側產品明細卡片 */}
            {/* <div className="col-md-6">
                <h2>{tempProduct ? `${tempProduct.title} 的產品明細` : '單一產品明細'}</h2>
                <ProductDetailCard product={tempProduct} />
            </div> */}

            {/* 建立 Modal 表單元件 */}
            {/* 將 ProductEditPage 的產品編輯（Modal表單）功能，封裝成 ProductForm 元件，並在 ProductEditPage 中使用。 */}
            <ProductForm 
                modalType={modalType} templateData={templateData} productModalRef={productModalRef} 
                handleModalInputChange={handleModalInputChange} 
                handleModalImageFileUpload={handleModalImageFileUpload} handleModalImageChange={handleModalImageChange} 
                handleAddImage={handleAddImage} handleRemoveImage={handleRemoveImage} closeModal={closeModal} 
                deleteProduct={deleteProduct} updateProduct={updateProduct} />

            {/* 原 Modal 表單元件 及 表單內容 已移至 ProductForm 元件中 */}
        </>
    );
};

export default ProductEditPage;



