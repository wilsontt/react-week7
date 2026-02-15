/**
 * 產品表單元件
 * 
 * 產品新增/編輯表單，包含所有產品欄位輸入與圖片處理功能
 * 
 * @param {Object} formData - 表單資料物件
 * @param {Function} onChange - 一般欄位變更處理函數
 * @param {Function} onImageChange - 圖片欄位變更處理函數
 * @param {Function} onAddImage - 新增圖片處理函數
 * @param {Function} onRemoveImage - 刪除圖片處理函數
 */

import { FaStar, FaRegStar } from "react-icons/fa";

import { useDispatch } from 'react-redux';
import { createAsynceMessage } from '../../slices/messageSlice';

function ProductForm({ 
    modalType, templateData, productModalRef, handleModalInputChange, handleModalImageFileUpload, 
    handleModalImageChange, handleAddImage, handleRemoveImage, closeModal, 
    deleteProduct, updateProduct }) {

    const totalImages = 1 + templateData.imagesUrl.filter((url) => url).length;
    const lastSubImage = templateData.imagesUrl[templateData.imagesUrl.length - 1] || "";
    const canAddMoreImages = totalImages < 5;
    const canAppendSubImage = canAddMoreImages && lastSubImage !== "";


    // 優化 ProductForm 元件，將產品新增/編輯表單功能，封裝成 ProductForm 元件，並在 ProductEditPage 中使用。
    return (
        <>
            {/* 建立 Modal 表單元件 */}
            <div className="modal fade"
                id="productModal"
                tabIndex={-1}
                aria-labelledby="productModalLabel"
                aria-hidden="true"
                ref={productModalRef}
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content border-0">
                        {/* 判斷是新增、編輯、刪除，顯示不同的背景顏色 */}
                        <div className={`modal-header bg-${
                            // 利用 modalType 判斷是刪除(danger)、編輯(warning)、新增(primary)，顯示不同的header顏色。
                            modalType === 'delete' ? 'danger' :
                                modalType === 'edit' ? 'warning' : 'primary'
                            } text-white`}>
                            <h5 id="productModalLabel" className="modal-title">
                                <span className="text-white">
                                    {modalType === 'delete' ? '刪除' :
                                        modalType === 'edit' ? '編輯' : '新增'}產品</span>
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {/* 利用 modalType 判斷是新增、編輯、刪除，顯示不同的表單內容 */}
                            {
                                modalType === 'delete' ? (
                                  <p className="fs-4">
                                      確定要刪除
                                      <span className="text-danger">{templateData.title}</span>嗎？
                                  </p>
                                ) : (
                                  // 新增、編輯 共用同一個表單，由 modalType 判斷是新增還是編輯。
                                  <>
                                    <div className="row">
                                        {/* 左側：圖片區塊 */}
                                        <div className="col-sm-4">
                                              <label htmlFor="imageFile" className="form-label">上傳圖片</label>
                                              <div>
                                                  <input
                                                      type="file"
                                                      accept=".jpg, .jpeg, .png"
                                                      className="form-control"
                                                      id="imageFile"
                                                      name="imageFile"
                                                      onChange={(e) => handleModalImageFileUpload(e)}
                                                  />
                                              </div>
                                              <div className="mb-3">
                                                  {/* <label htmlFor="imageUrl" className="form-label">輸入圖片網址</label> */}
                                                  <input
                                                      type="url"
                                                      id="imageUrl"
                                                      name="imageUrl"
                                                      className="form-control"
                                                      placeholder="請輸入圖片連結"
                                                      value={templateData.imageUrl}
                                                      onChange={(e) => handleModalInputChange(e)}
                                                  />
                                              </div>
                                              <div className="mb-2">
                                                  {
                                                      // 判斷是否存在主圖，如果存在則顯示圖片。
                                                      templateData.imageUrl && (
                                                          <img className="img-fluid"
                                                              src={templateData.imageUrl} alt="主圖" />
                                                      )}
                                              </div>
                                              <div>
                                                  {
                                                      templateData.imagesUrl.map((url, index) => (
                                                          <div key={index}>
                                                              <label htmlFor="imageUrl" className="form-label">
                                                                  輸入圖片網址
                                                              </label>
                                                              <input
                                                                  type="url"
                                                                  className="form-control"
                                                                  placeholder={`圖片網址${index + 1}`}
                                                                  value={url}
                                                                  onChange={(e) => handleModalImageChange(index, e.target.value)}
                                                              />
                                                              {
                                                                  url &&
                                                                  <img
                                                                      className="img-fluid"
                                                                      src={url}
                                                                      alt={`副圖${index + 1}`}
                                                                  />
                                                              }
                                                          </div>
                                                      ))
                                                  }
                                                  {
                                                      // 優化 handleAddImage：限制圖片最多只能5張，如果小於5張，則顯示新增圖片按鈕。
                                                      canAppendSubImage && (
                                                          <button
                                                              type="button"
                                                              className="btn btn-outline-primary btn-sm d-block w-100"
                                                              onClick={() => handleAddImage()}
                                                          >
                                                              新增圖片
                                                          </button>
                                                      )
                                                  }

                                              </div>
                                              {
                                                  // 優化 handleRemoveImage：imagesUrl 陣列有值才顯示 刪除圖片按鈕。
                                                  templateData.imagesUrl.length >= 1 &&
                                                  <div>
                                                      <button
                                                          type="button"
                                                          className="btn btn-outline-danger btn-sm d-block w-100"
                                                          onClick={() => handleRemoveImage()}
                                                      >
                                                          刪除圖片
                                                      </button>
                                                  </div>
                                              }
                                        </div>

                                        {/* 右側：表單欄位區塊 */}
                                        <div className="col-sm-8">
                                          {/* 產品標題 */}
                                          <div className="mb-3">
                                                <label htmlFor="title" className="form-label">標題</label>
                                                <input
                                                    name="title"
                                                    id="title"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="請輸入標題"
                                                    value={templateData.title}
                                                    onChange={(e) => handleModalInputChange(e)}
                                                />
                                          </div>

                                          {/* 產品分類、單位、原價、售價 */}
                                          <div className="row">
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="category" className="form-label">分類</label>
                                                    <input
                                                        name="category"
                                                        id="category"
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="請輸入分類"
                                                        value={templateData.category}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    />
                                                </div>
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="unit" className="form-label">單位</label>
                                                    <input
                                                        name="unit"
                                                        id="unit"
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="請輸入單位"
                                                        value={templateData.unit}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    />
                                                </div>
                                          </div>

                                          <div className="row">
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="origin_price" className="form-label">原價</label>
                                                    <input
                                                        name="origin_price"
                                                        id="origin_price"
                                                        type="text"
                                                        min="0"
                                                        // 在輸入價格時，透過 replace 來限制不能輸入負數
                                                        // onInput={(e) => e.target.value = e.target.value.replace(/-/g, '')}
                                                        className="form-control"
                                                        placeholder="請輸入原價"
                                                        value={templateData.origin_price}
                                                        onChange={(e) => {
                                                            e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                                            handleModalInputChange(e)
                                                        }}
                                                        />
                                                </div>
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="price" className="form-label">售價</label>
                                                    <input
                                                        name="price"
                                                        id="price"
                                                        type="text"
                                                        min="0"
                                                        // 在輸入價格時，透過 replace 來限制不能輸入負數
                                                        // onInput={(e) => e.target.value = e.target.value.replace(/-/g, '')}
                                                        className="form-control"
                                                        placeholder="請輸入售價"
                                                        value={templateData.price}
                                                        onChange={(e) => {
                                                            e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                                            handleModalInputChange(e)
                                                        }}
                                                    />
                                                </div>
                                          </div>
                                          <hr />
                                          
                                          {/* 產品描述與說明內容 */}
                                          <div className="row">
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="description" className="form-label">商品說明</label>
                                                    <textarea
                                                        name="description"
                                                        id="description"
                                                        className="form-control"
                                                        placeholder="請輸入產品描述"
                                                        value={templateData.description}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mb-3 col-md-6">
                                                    <label htmlFor="content" className="form-label">商品內容</label>
                                                    <textarea
                                                        name="content"
                                                        id="content"
                                                        className="form-control"
                                                        placeholder="請輸入說明內容"
                                                        value={templateData.content}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    ></textarea>
                                                </div>
                                          </div>
                                          <hr />
                                          
                                          {/* 產品評分 與 是否啟用 */}
                                          <div className="row">
                                              <div className="mb-3 col-md-6">
                                                  <label htmlFor="rating" className="form-label text-primary">產品評比分數 1-5顆星</label>
                                                  <div className="d-flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span
                                                                key={star}
                                                                onClick={() => handleModalInputChange({
                                                                        target: { name: 'rating', value: star, type: 'number' }
                                                                    })
                                                                }
                                                                style={{ cursor: 'pointer', fontSize: '24px'}}
                                                                >
                                                                    {star <= (templateData.rating || 0) ? (
                                                                        <FaStar className="text-warning" />
                                                                    ) : (
                                                                        <FaRegStar className="text-secondary" />
                                                                    )}
                                                            </span>
                                                        ))}
                                                  </div>
                                              </div>
                                              <div className="mb-3 col-md-6">
                                                  {/* 是否啟用 checkbox */}
                                                  <div className="form-check text-primary d-flex align-items-center gap-2">
                                                        <input
                                                            name="is_enabled"
                                                            id="is_enabled"
                                                            className="form-check-input border border-2 border-secondary"
                                                            type="checkbox"
                                                            checked={templateData.is_enabled}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                        <span className={
                                                            templateData.is_enabled === true 
                                                            ? 'text-success fw-bold' : 'text-danger fw-bold'}>是否啟用</span>
                                                  </div>
                                              </div>
                                          </div>
                                        </div>
                                    </div>
                                  </>
                                )
                            }
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => closeModal()}
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                className={`btn ${
                                    // 利用 modalType 判斷是刪除(danger)、編輯(primary)，顯示不同的按鈕顏色。
                                    modalType === 'delete' ? 'btn-danger' : 'btn-primary'
                                    }`}
                                onClick={() => {
                                    // 利用 modalType 判斷是刪除(danger)、編輯(primary)，執行不同的操作。
                                    if (modalType === 'delete') {
                                        void (async () => {
                                            await deleteProduct(templateData.id);
                                        })();
                                    } else {
                                        void (async () => {
                                            await updateProduct(templateData.id);
                                        })();
                                    }
                                }}>
                                {modalType === 'delete' ? '確認刪除' : '確認'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductForm;