import { FaBagShopping } from "react-icons/fa6"
import axios from "axios";
import { useState, useEffect } from "react";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;
// console.log(import.meta.env.VITE_API_BASE);

const OrderManagement = () => {

  const [ordermanagement, setOrderManagement] = useState([]);

  // 取得訂單列表 GET api/OrderManagement
  const getOrderManagement = async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE}/api/${VITE_API_PATH}/order`);
      setOrderManagement(response.data.data);
      // console.log(response.data.data);
    } catch (error) {
      console.error('取得訂單列表失敗', error);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(`${VITE_API_BASE}/api/${VITE_API_PATH}/order`);
        if (!cancelled) {
          setOrderManagement(response.data.data);
          console.log(response.data.data);
        }
      } catch (error) {
        console.error('取得訂單列表失敗', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  return (
    <>
      {/* 利用 JSON.stringify 來顯示 OrderManagement 的資料 */}
      {/* null, 2 是為了格式化 JSON 字串 */}
      <pre>{JSON.stringify(OrderManagement, null, 2)}</pre>

      <h2 className="text-left mt-2">
        <FaBagShopping className="text-warning me-2" size={32} />客戶訂單列表</h2>
      <hr />
      <div className="container">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>客戶姓名</th>
              <th>電話</th>
              <th>收件地址</th>
              <th>訂單日期</th>
              <th>訂單金額</th>
              <th>訂單狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>張三</td>
              <td>0912345678</td>
              <td>台北市中山區</td>
              <td>2026-01-01</td>
              <td>100</td>
              <td>待付款</td>
              <td>
                <button className="btn btn-primary">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default OrderManagement;