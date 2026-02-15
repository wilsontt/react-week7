import { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { useForm} from "react-hook-form";

import { createAsynceMessage } from '../slices/messageSlice';
import { setCart } from '../slices/cartSlice';
import { useDispatch } from 'react-redux';

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const Cart = () => {

  // const navigate = useNavigate();
  /** 關閉後要導向的路徑（填寫訂單時設為 /Cart），在 hidden.bs.modal 時執行 */
  // const afterCloseNavigateToRef = useRef(null);

  const [cartData, setCartData] = useState({
    carts: [],
    total: 0,
    final_total: 0,
  });

  // 使用 useDispatch 來發送 Redux 動作
  const dispatch = useDispatch();

  /** 取得購物車列表 GET api/cart */
  const getCart = async () => {
    try {
      const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/cart`;
      const res = await axios.get(url);
      setCartData(res.data.data ?? { carts: [], total: 0, final_total: 0 });
      dispatch(setCart(res.data.data ?? { carts: [], total: 0, final_total: 0 }));
      // console.log('購物車列表：', res.data.data);
    } catch (err) {
      console.error("取得購物車失敗", err.response?.data ?? err);
      dispatch(createAsynceMessage({
        success: false,
        message: "取得購物車失敗：" + err.response?.data?.message || err.message || "請稍後再試。",
      }));
    }
  };

  // 取得購物車列表
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/cart`;
        const res = await axios.get(url);
        if (!cancelled) {
          setCartData(res.data.data ?? { carts: [], total: 0, final_total: 0 });
          dispatch(setCart(res.data.data ?? { carts: [], total: 0, final_total: 0 }));
          console.log("購物車列表:", res.data);
        }
      } catch (err) {
        if (!cancelled) console.error("取得購物車失敗", err.response?.data ?? err);
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  /** 更新商品數量 PUT api/cart/${cartId} */
  const updateCart = async (cartId, productId, qty) => {
    try {
      const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/cart/${cartId}`;
      await axios.put(url, { data: { product_id: productId, qty } });
      // console.log("更新購物車:", cartId, productId, qty);
      getCart();
    } catch (err) {
      console.error("更新購物車失敗", err.response?.data ?? err);
    }
  };

  /** 清除單一筆購物車 DELETE api/cart/${id} */
  const deleteCart = async (id) => {
    try {
      const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/cart/${id}`;
      await axios.delete(url);
      getCart();
    } catch (err) {
      console.error("刪除購物車失敗", err.response?.data ?? err);
    }
  };

  // 當購物車是空的時候, 清空購物車 功能要 disabled
  const isCartEmpty = cartData.carts.length === 0;
  const deleteCartAllDisabled = isCartEmpty ? "disabled" : "";
  // const deleteCartDisabled = id => isCartEmpty ? "disabled" : "";

  /** 清空購物車 DELETE api/carts */
  const deleteCartAll = async () => {
    try {
      const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/carts`;
      await axios.delete(url);
      getCart();
    } catch (err) {
      console.error("清空購物車失敗", err.response?.data ?? err);
    }
  };

  const { carts } = cartData;
  // console.log("目前購物車:", cartData);
  
    // 使用React HookForm 來管理表單狀態和驗證
    const {
      register,               // 用來註冊表單欄位
      handleSubmit,           // 用來提交表單, 當表單驗證成功時，會調用 onOrderSubmit 函數。
      reset,                  // 重置表單欄位
      getValues,              // 取得表單欄位值
      formState: { errors },  // 表單錯誤
    } = useForm({             // 使用 useForm，設定運作方式為 onSubmit
      mode: "onChange",       // 設定表單驗證模式為 onChange，當表單欄位有變化時，才進行驗證
      defaultValues: {        // 設定預設值
        name: "",
        email: "",
        phone: "",
        address: "",
        payment_method: "1",
        message: "",
      },
    });
    // console.log(errors);
  
    // 提交訂單
    // const onOrderSubmit = (data, message) => {
      // console.log(data, message);    // 提交表單後，印出表單資料
    // };

  /** 是否展開「填寫訂單資料」區塊；true = 顯示表單、按鈕為「取消結帳」，false = 隱藏表單、按鈕為「結帳」 */
  const [isOrderFormExpanded, setIsOrderFormExpanded] = useState(false);

  /** 切換「填寫訂單資料」區塊：展開時顯示表單並改為「取消結帳」，收合時隱藏表單、清空表單並改為「結帳」 */
  const toggleOrderForm = () => {
    if (isOrderFormExpanded) {
      reset();
      setIsOrderFormExpanded(false);
    } else {
      setIsOrderFormExpanded(true);
    }
  };

  // 訂單送出確認
  const onOrderSubmitConfirm = async () => {
    // 取得表單欄位的值
    const values = getValues();   
    try {
      const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/order`;
      // console.log("訂單送出確認", values);
      await axios.post(url, { 
        data: {
          user: { 
            name: values.name, 
            email: values.email, 
            tel: values.phone, 
            address: values.address }, 
          message: values.message, 
          payment_method: values.payment_method
        } 
      });
      // console.log("訂單送出確認成功");
      
      dispatch(createAsynceMessage({
        success: true,
        message: "訂單送出確認成功",
      }));

      // 訂單送出成功後：清空購物車、重置表單、關閉訂單表單區塊
      // await deleteCartAll();
      setCartData({ carts: [], total: 0, final_total: 0});
      reset();
      setIsOrderFormExpanded(false);
    } catch (err) {
      console.error("訂單送出確認失敗", err.response?.data ?? err);
      // 失敗時可顯示錯誤訊息給使用者（例如用 alert 或 toast）
      dispatch(createAsynceMessage({
        success: false,
        message: "訂單送出確認失敗：" + err.response?.data?.message || err.message || "請稍後再試。",
      }));
    }
  };

  return (
    <>
      {/* 利用 JSON.stringify 來顯示 carts 的資料 */}
      {/* null, 2 是為了格式化 JSON 字串 */}
      {/* <pre>{JSON.stringify(carts, null, 2)}</pre> */}

      <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
        <h2 className="text-left mb-0">
          <FaShoppingCart className="me-2 text-warning" size={32} />購物車列表</h2>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => deleteCartAll()}
          // 當購物車是空的時候, 清空購物車 功能要 disabled, 不會觸發 deleteCartAll 函數
          disabled={deleteCartAllDisabled}
        >
          清空購物車
        </button>
      </div>
      <hr />

      <div className="container">
        {!carts?.length ? (
          <>
            <p className="text-muted">購物車是空的</p>
            <Link to="/ProductList" className="btn btn-secondary">來去逛逛</Link>
          </>
        ) : (
          <>
            {/* 行動裝置：卡片列表，無水平捲軸 */}
            <div className="d-md-none w-100">
              {carts.map((item) => (
                <div key={item.id} className="border rounded p-2 mb-2 bg-white">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="d-flex gap-2 flex-grow-1 min-w-0">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product?.title ?? ""}
                          className="rounded flex-shrink-0"
                          style={{ width: 64, height: 64, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-light rounded flex-shrink-0 d-flex align-items-center justify-content-center small text-muted"
                          style={{ width: 64, height: 64 }}
                        >
                          無圖
                        </div>
                      )}
                      <div className="min-w-0 flex-grow-1">
                        <div className="small text-truncate" title={item.product?.title}>
                          {item.product?.title ?? "-"}
                        </div>
                        <div className="mt-1 text-end text-muted small">
                          ${Number(item.total ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm p-1 flex-shrink-0"
                      aria-label="移除"
                      onClick={() => deleteCart(item.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <div className="d-flex align-items-center gap-1">
                      <div className="d-flex align-items-center border rounded">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm rounded-0 rounded-start"
                          aria-label="減少數量"
                          onClick={() =>
                            updateCart(
                              item.id,
                              item.product_id,
                              Math.max(1, (item.qty ?? 1) - 1)
                            )
                          }
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.qty ?? 1}
                          onChange={(e) => {
                            const v = parseInt(e.target, 10);
                            const qty = Number.isNaN(v) || v < 1 ? 1 : v;
                            updateCart(item.id, item.product_id, qty);
                          }}
                          className="form-control form-control-sm border-0 text-center"
                          style={{ width: 48 }}
                          aria-label="數量"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm rounded-0 rounded-end"
                          aria-label="增加數量"
                          onClick={() =>
                            updateCart(
                              item.id,
                              item.product_id,
                              (item.qty ?? 1) + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <span className="small">件</span>
                    </div>
                    <strong>${Number(item.total ?? 0).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                <strong>總計</strong>
                <strong>NT：${(cartData.total).toLocaleString()}</strong>
              </div>
            </div>

            {/* 桌機：表格 */}
            <div className="d-none d-md-block w-100">
              <table
                className="table align-middle table-borderless"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr className="border-bottom text-center">
                    <th style={{ width: "8%" }}></th>
                    <th style={{ width: "12%" }}>圖片</th>
                    <th style={{ width: "50%" }}>品名</th>
                    <th style={{ width: "15%" }}>數量/單位</th>
                    <th style={{ width: "15%" }}>小計</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((item) => (
                    <tr key={item.id} className="border-bottom">
                      <td className="align-middle text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm p-1"
                          aria-label="移除"
                          onClick={() => deleteCart(item.id)}
                        >
                          <FaTimes />
                        </button>
                      </td>
                      <td className="align-middle">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product?.title ?? ""}
                            className="img-fluid rounded"
                            style={{
                              width: "100%",
                              maxWidth: 80,
                              height: 80,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded d-flex align-items-center justify-content-center small text-muted"
                            style={{ width: 80, height: 80 }}
                          >
                            無圖
                          </div>
                        )}
                      </td>
                      <td className="text-start small text-truncate" title={item.product?.title}>
                        {item.product?.title ?? "-"}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <div className="d-flex align-items-center border rounded">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm rounded-0 rounded-start"
                              aria-label="減少數量"
                              onClick={() =>
                                updateCart(
                                  item.id,
                                  item.product_id,
                                  Math.max(1, (item.qty ?? 1) - 1)
                                )
                              }
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.qty ?? 1}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                const qty = Number.isNaN(v) || v < 1 ? 1 : v;
                                updateCart(item.id, item.product_id, qty);
                              }}
                              className="form-control form-control-sm border-0 text-center"
                              style={{ width: 56 }}
                              aria-label="數量"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm rounded-0 rounded-end"
                              aria-label="增加數量"
                              onClick={() =>
                                updateCart(
                                  item.id,
                                  item.product_id,
                                  (item.qty ?? 1) + 1
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                          <span className="small">件</span>
                        </div>
                      </td>
                      <td className="text-end">
                        ${Number(item.total ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-end border-bottom">
                    <td colSpan={4}>
                      <strong>總計</strong>
                    </td>
                    <td>
                      <strong>NT：${(cartData.total).toLocaleString()}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* 填寫資料按鈕：按下顯示「填寫付款資料」、按鈕變「取消填寫付款資料」；再按隱藏區塊、清空表單、按鈕變「填寫付款資料」 */}
            <div className="row mb-3">
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={toggleOrderForm}
                  aria-expanded={isOrderFormExpanded}
                  aria-controls="order-form"
                >
                  {isOrderFormExpanded ? "取消填寫付款資料" : "填寫付款資料"}
                </button>
              </div>
              <div className="col-6 text-end">
                <Link to="/ProductList" className="btn btn-secondary">
                  繼續購物
                </Link>
              </div>
            </div>

            {/* 填寫訂單資料：依 isOrderFormExpanded 顯示／隱藏（Bootstrap collapse 樣式） */}
            <hr />
            <div
              className={`container collapse${isOrderFormExpanded ? " show" : ""}`}
              id="order-form"
            >
              <h4 className="text-left"><b>付款資訊</b></h4>
              <hr />
              <form action="" onSubmit={handleSubmit(onOrderSubmitConfirm)}>
                  <div className="container mb-5">
                      <div className="row g-3">
                        {/* 收件人資料 */}
                        <div className="col-12 col-md-6">
                          <div className="card">
                            <div className="card-header"><b>聯絡資訊</b></div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-12">
                                  <label htmlFor="name" className="form-label d-block w-100 text-start">收件人姓名</label>
                                  <input 
                                      type="text" id="name" name="name" placeholder="收件人姓名 your name"
                                      {...register("name", { required: true })}
                                      className="form-control" />
                                      {errors.name && <p className="text-danger">這個欄位必填</p>}
                                  <label htmlFor="email" className="form-label d-block w-100 text-start">收件人EMAIL</label>
                                  <input 
                                      type="email" id="email" name="email" placeholder="收件人EMAIL：your@example.com"
                                      {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                                      className="form-control" />
                                      {errors.email && <p className="text-danger">Email 格式不正確</p>}
                                  <label htmlFor="phone" className="form-label text-left d-block w-100 text-start">收件人手機電話</label>
                                  <input 
                                      type="text" id="phone" name="phone" placeholder="收件人手機 09XXX-XXX-XXX"
                                      {...register("phone", { required: true, pattern: /^09\d{8}$/ })}
                                      className="form-control" />
                                      {errors.phone && <p className="text-danger">手機格式不正確</p>}
                                  <label htmlFor="address" className="form-label text-right d-block w-100 text-start">收件人地址</label>
                                  <input 
                                      type="text" id="address" name="address" placeholder="收件人地址 your address"
                                      {...register("address", { required: true })}
                                      className="form-control" />
                                      {errors.address && <p className="text-danger">這個欄位必填</p>}
                                  <label htmlFor="message" className="form-label text-right d-block w-100 text-start">留言</label>
                                  <input 
                                      type="text" id="message" name="message" placeholder="optional：留言 Leave a message."
                                      {...register("message")}
                                      className="form-control" />
                                      {/* {errors.message && <p className="text-danger">這個欄位必填</p>} */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* 付款方式 ＋ 付款金額 */}
                        <div className="col-12 col-md-6">
                          <div>
                            <div className="card">
                              <div className="card-header"><b>付款方式</b></div>
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-12">
                                    <label htmlFor="payment_method" className="form-label d-block w-100 text-start">付款方式</label>
                                    <select
                                      id="payment_method"
                                      className="form-select"
                                      {...register("payment_method")}
                                    >
                                      <option value="1">信用卡</option>
                                      <option value="2">ATM轉帳</option>
                                      <option value="3">貨到付款</option>
                                      <option value="4">超商取貨</option>
                                      {/* <option value="5">其他</option> */}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <br />
                            <div className="card">
                            <div className="card-header"><b>結帳金額</b></div>
                              <div className="card-body">
                                <table className="table table-bordered">
                                  <tbody>
                                    <tr>
                                      <td className="text-start">訂單金額(未稅）</td>
                                      <td><strong>NT：${(cartData.total).toLocaleString()}</strong></td>
                                    </tr>
                                    <tr>
                                      <td className="text-start">結帳總金額(含稅、運費)</td>
                                        <td><strong>NT：
                                            <b className="text-danger">
                                              ${(cartData.final_total * 1.05).toLocaleString()}
                                            </b>
                                          </strong></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr />
                      {/* 提交訂單 或 取消訂單 */}
                      <div className="row text-end mb-3">
                        <div className="col-12 col-md-6">
                        <button 
                          type="submit" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteCartAll()}
                        >取消付款</button>
                        </div>
                        <div className="col-12 col-md-6">
                        <button 
                          type="button" 
                          className="btn btn-success"
                          onClick={() => {
                            // 先驗證再送出
                            handleSubmit(
                              () => onOrderSubmitConfirm(),
                              (err) => console.log("表單驗證未過", err)
                            )();
                          }}
                        >確認付款</button>
                        </div>
                      </div>
                  </div>  
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
