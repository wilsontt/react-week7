/**
 * 訂單 Modal 元件
 *
 * 用於查看、編輯、刪除訂單，三種模式共用同一 Modal。
 * 不依賴 columns，直接接收 order 物件並渲染完整內容。
 *
 * @param {Object} order - 訂單物件（含 user、products 等）
 * @param {'view'|'edit'|'delete'} mode - 模式
 * @param {Function} onClose - 關閉 Modal
 * @param {Function} onConfirm - 確認（編輯送出 { id, data }、刪除確認傳 order）
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from 'bootstrap/js/dist/modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveIsPaid } from '../../utils/orderUtils';

/** 將 Unix 時間戳轉為可讀日期字串 */
const formatOrderDate = (timestamp) => {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

/** 訂單編輯表單（收件人資訊 + 商品明細可編輯，數量變更自動計算小計） */
function OrderEditContent({ order, editForm, onEditFormChange }) {
  const handleUserChange = (field, value) => {
    onEditFormChange({ user: { ...editForm.user, [field]: value } });
  };
  const handleProductQtyChange = (productId, qty) => {
    const num = Math.max(1, Number(qty) || 1);
    const productsMap = { ...editForm.products };
    const item = productsMap[productId];
    if (item) {
      const origQty = Number(item.qty) || 1;
      const origTotal = Number(item.total) || 0;
      const unitPrice = origQty > 0 ? origTotal / origQty : 0;
      productsMap[productId] = { ...item, qty: num, total: Math.round(unitPrice * num) };
      onEditFormChange({ products: productsMap });
    }
  };
  const user = editForm.user ?? order.user ?? {};
  const editProducts = editForm.products ?? order.products ?? {};
  const displayProducts = Object.entries(editProducts).map(([id, item]) => ({ ...item, _id: id }));

  return (
    /** 訂單編輯區塊（edit 模式，可編輯） */
    <div className="text-start">
      <div className="row mb-3">
        <div className="col-6">
          <span className="text-muted">訂單日期：</span>
          {formatOrderDate(order.create_at)}
        </div>
        <div className="col-6">
          <span className="text-muted">訂單編號：</span>
          {order.id}
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label text-muted small mb-0">訂單狀態</label>
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              checked={editForm.is_paid}
              onChange={(e) => onEditFormChange({ is_paid: e.target.checked })}
            />
            <label className="form-check-label">已付款</label>
          </div>
        </div>
        <div className="col-6">
          <span className="text-muted">訂單金額：</span>
          <span className="fw-bold">
            ${formatCurrency(
              Object.values(editProducts).reduce((sum, p) => sum + (Number(p.total) || 0), 0)
            )}
          </span>
        </div>
      </div>
      <hr />
      <h6 className="mb-2">收件人資訊</h6>
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-0">姓名</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={user.name ?? ''}
            onChange={(e) => handleUserChange('name', e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-0">EMAIL</label>
          <input
            type="email"
            className="form-control form-control-sm"
            value={user.email ?? ''}
            onChange={(e) => handleUserChange('email', e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-0">電話</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={user.tel ?? ''}
            onChange={(e) => handleUserChange('tel', e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label text-muted small mb-0">地址</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={user.address ?? ''}
            onChange={(e) => handleUserChange('address', e.target.value)}
          />
        </div>
        <div className="col-12 mb-2">
          <label className="form-label text-muted small mb-0">留言</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editForm.message ?? order.message ?? ''}
            onChange={(e) => onEditFormChange({ message: e.target.value })}
          />
        </div>
      </div>
      <hr />
      <h6 className="mb-2">商品明細（共 {displayProducts.reduce((s, p) => s + (Number(p.qty) || 0), 0)} 件）</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr className="table-light">
            <th>商品名稱</th>
            <th className="text-center">數量</th>
            <th className="text-end">小計</th>
          </tr>
        </thead>
        <tbody>
          {displayProducts.map((item) => (
            <tr key={item._id}>
              <td>{item.product?.title ?? '-'}</td>
              <td className="text-center">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="d-flex align-items-center border rounded">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-0 rounded-start"
                      aria-label="減少數量"
                      onClick={() => handleProductQtyChange(item._id, (item.qty ?? 1) - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      className="form-control form-control-sm border-0 text-center"
                      style={{ width: 56 }}
                      value={item.qty ?? 1}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        handleProductQtyChange(item._id, Number.isNaN(v) || v < 1 ? 1 : v);
                      }}
                      aria-label="數量"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-0 rounded-end"
                      aria-label="增加數量"
                      onClick={() => handleProductQtyChange(item._id, (item.qty ?? 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </td>
              <td className="text-end">${formatCurrency(item.total ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 訂單詳情區塊（view 模式，唯讀） */
function OrderDetailContent({ order, products, totalQty }) {
  return (
    <div className="text-start">
      <div className="row mb-3">
        <div className="col-6">
          <span className="text-muted">訂單日期：</span>
          {formatOrderDate(order.create_at)}
        </div>
        <div className="col-6">
          <span className="text-muted">訂單編號：</span>
          {order.id}
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-6">
          <span className="text-muted">訂單狀態：</span>
          <span className={`badge ${resolveIsPaid(order) ? 'bg-success' : 'bg-danger'}`}>
            {resolveIsPaid(order) ? '已付款' : '未付款'}
          </span>
        </div>
        <div className="col-6">
          <span className="text-muted">訂單金額：</span>
          <span className="fw-bold">${formatCurrency(order.total)}</span>
        </div>
      </div>
      <hr />
      <h6 className="mb-2">收件人資訊</h6>
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <span className="text-muted">姓名：</span>
          {order.user?.name ?? '-'}
        </div>
        <div className="col-md-6 mb-2">
          <span className="text-muted">EMAIL：</span>
          {order.user?.email ?? '-'}
        </div>
        <div className="col-md-6 mb-2">
          <span className="text-muted">電話：</span>
          {order.user?.tel ?? '-'}
        </div>
        <div className="col-md-6 mb-2">
          <span className="text-muted">地址：</span>
          {order.user?.address ?? '-'}
        </div>
        <div className="col-12 mb-2">
          <span className="text-muted">留言：</span>
          {order.message ?? '-'}
        </div>
      </div>
      <hr />
      <h6 className="mb-2">商品明細（共 {totalQty} 件）</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr className="table-light">
            <th>商品名稱</th>
            <th className="text-center">數量</th>
            <th className="text-end">小計</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={item.product?.id ?? item.id ?? `row-${index}`}>
              <td>{item.product?.title ?? '-'}</td>
              <td className="text-center">{item.qty ?? 0}</td>
              <td className="text-end">${formatCurrency(item.total ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderModal({ order, mode, onClose, onConfirm }) {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  const [editForm, setEditForm] = useState(() => ({
    is_paid: resolveIsPaid(order),
    user: { ...(order?.user ?? {}) },
    message: order?.message ?? '',
    products: order?.products ? JSON.parse(JSON.stringify(order.products)) : {},
  }));

  const onEditFormChange = (patch) => {
    setEditForm((prev) => ({
      ...prev,
      ...patch,
      user: patch.user ?? prev.user,
      products: patch.products ?? prev.products,
    }));
  };

  useEffect(() => {
    if (!order || !modalRef.current) return;
    const el = modalRef.current;
    const modal = new Modal(el);
    modalInstanceRef.current = modal;
    let disposed = false;
    const disposeModal = () => {
      if (disposed) return;
      disposed = true;
      try {
        modal.dispose();
      } catch {
        // 忽略已銷毀的 modal
      }
      modalInstanceRef.current = null;
    };
    const handleHidden = () => {
      disposeModal();
      onClose();
    };
    el.addEventListener('hidden.bs.modal', handleHidden);
    requestAnimationFrame(() => {
      if (el.isConnected && !disposed) modal.show();
    });
    return () => {
      el.removeEventListener('hidden.bs.modal', handleHidden);
      disposeModal();
    };
  }, [order, onClose]);

  if (!order) return null;

  const headerClass = mode === 'delete' ? 'danger' : mode === 'edit' ? 'warning' : 'primary';
  const title = mode === 'delete' ? '刪除訂單' : mode === 'edit' ? '編輯訂單' : '訂單詳情';

  const products = Object.values(order.products || {});
  const totalQty = products.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);

  const modalContent = (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="orderModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className={`modal-header bg-${headerClass} text-white`}>
            <h5 className="modal-title" id="orderModalLabel">{title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {mode === 'delete' ? (
              <p className="fs-5">
                確定要刪除訂單編號 <span className="text-danger fw-bold">{order.id}</span> 嗎？
              </p>
            ) : mode === 'edit' ? (
              <OrderEditContent
                order={order}
                editForm={editForm}
                onEditFormChange={onEditFormChange}
              />
            ) : (
              <OrderDetailContent order={order} products={products} totalQty={totalQty} />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              關閉
            </button>
            {(mode === 'edit' || mode === 'delete') && (
              <button
                type="button"
                className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={async () => {
                  try {
                    if (mode === 'delete') {
                      await onConfirm?.(order);
                    } else {
                      const products = editForm.products || {};
                      const num = Object.values(products).reduce(
                        (sum, p) => sum + (Number(p.qty) || 0),
                        0
                      );
                      const productsForApi = Object.fromEntries(
                        Object.entries(products).map(([k, v]) => [
                          k,
                          {
                            id: k,
                            product_id: v.product_id ?? v.product?.id,
                            qty: String(v.qty ?? 1),
                          },
                        ])
                      );
                      await onConfirm?.({
                        id: order.id,
                        data: {
                          create_at: order.create_at,
                          is_paid: editForm.is_paid,
                          message: editForm.message ?? '',
                          products: productsForApi,
                          user: editForm.user ?? {},
                          num,
                        },
                      });
                    }
                    modalInstanceRef.current?.hide();
                  } catch {
                    /** 儲存失敗時不關閉 Modal，錯誤已由 createAsyncMessage 顯示 */
                  }
                }}
              >
                {mode === 'delete' ? '確認刪除' : '儲存'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default OrderModal;
