import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../components/Pagination";
import { FaEdit, FaEye, FaShoppingCart, FaTrash } from "react-icons/fa";

import OrderTable from "../components/OrderTable";
import OrderModal from "../components/OrderModal";
import {
  getOrdersAsync,
  deleteOrderAsync,
  updateOrderAsync,
} from "../../slices/orderSlice";
import { createAsyncMessage } from "../../slices/messageSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveIsPaid } from "../../utils/orderUtils";

/** 將 Unix 時間戳轉為可讀日期字串 */
const formatOrderDate = (timestamp) => {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    // hour: '2-digit', minute: '2-digit',
  });
};

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, pagination } = useSelector((state) => state.order);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedOrder, setSelectedOrder] = useState(null);

  /** 掛載時設定 token 並取得訂單列表 */
  useEffect(() => {
    const token = document.cookie
      .split(';')
      .find((row) => row.startsWith('hexToken='))
      ?.split('=')[1];
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    dispatch(getOrdersAsync(1));
  }, [dispatch]);

  const handleChangePage = (page) => {
    dispatch(getOrdersAsync(page));
  };

  const openModal = (mode, order) => {
    setModalMode(mode);
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  /** 查看／編輯：Hexschool API 無單筆訂單端點，直接使用列表的 order */
  const handleView = (order) => openModal('view', order);
  const handleUpdate = (order) => openModal('edit', order);
  const handleDelete = (order) => openModal('delete', order);

  const handleModalConfirm = async (payload) => {
    if (modalMode === 'delete') {
      const result = await dispatch(deleteOrderAsync(payload.id));
      if (deleteOrderAsync.rejected.match(result)) {
        const msg = result.payload?.message ?? '訂單刪除失敗，此 API 可能不支援訂單刪除';
        dispatch(createAsyncMessage({ success: false, message: msg }));
        throw new Error(msg);
      }
    } else if (modalMode === 'edit') {
      const result = await dispatch(updateOrderAsync(payload));
      if (updateOrderAsync.rejected.match(result)) {
        const msg = result.payload?.message ?? '訂單更新失敗，此 API 可能不支援訂單編輯';
        dispatch(createAsyncMessage({ success: false, message: msg }));
        throw new Error(msg);
      }
    }
    closeModal();
  };

  /** 定義訂單列表表格欄位（不含收件人 EMAIL、電話、地址，詳情在 Modal 顯示） */
  const columns = [
    {
      key: 'create_at',
      label: '訂單日期',
      className: 'text-left',
      render: (order) => formatOrderDate(order.create_at),
    },
    { key: 'id', label: '訂單編號', className: 'text-center' },
    {
      key: 'user_name',
      label: '客戶姓名',
      className: 'text-center',
      render: (order) => order.user?.name ?? '-',
    },
    {
      key: 'products_qty',
      label: '品項數量',
      className: 'text-center',
      render: (order) =>
        Object.values(order.products || {}).reduce((sum, p) => sum + (Number(p.qty) || 0), 0),
    },
    {
      key: 'total',
      label: '訂單金額',
      className: 'text-center',
      render: (order) => formatCurrency(order.total ?? 0),
    },
    {
      key: 'is_paid',
      label: '訂單狀態',
      className: 'text-center',
      render: (order) => {
        const isPaid = resolveIsPaid(order);
        return (
          <span className={`${isPaid ? 'bg-success' : 'bg-danger'}
                  fs-6 fw-light px-1 py-0 rounded-pill text-white`}>
                  {isPaid ? '已付款' : '未付款'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '操作',
      className: 'text-center',
      render: (order) => (
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleView(order)}
          >
            <FaEye className="me-2" size={14} />查看
          </button>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            onClick={() => handleUpdate(order)}
          >
            <FaEdit className="me-2" size={14} />編輯
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleDelete(order)}
          >
            <FaTrash className="me-2" size={14} />刪除
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 利用 JSON.stringify 來顯示 products 的資料 */}
      {/* null, 2 是為了格式化 JSON 字串 */}
      {/* <pre>{JSON.stringify(orders, null, 2)}</pre> */}

      <h2 className="text-left mt-2">
        <FaShoppingCart className="text-warning me-2" size={32} />客戶訂單列表</h2>
      <hr />
      <div className="container">
        <OrderTable orders={orders} columns={columns} />
      </div>
      {pagination?.total_pages > 0 && (
        <Pagination pagination={pagination} onChangePage={handleChangePage} />
      )}
      {modalOpen && selectedOrder && (
        <OrderModal
          key={selectedOrder.id}
          order={selectedOrder}
          mode={modalMode}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
};

export default OrderManagement;
