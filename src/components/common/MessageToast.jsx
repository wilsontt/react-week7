// 訊息彈跳視窗 
// 用於顯示訊息，依 type 決定顏色，自動關閉。
// 使用 Bootstrap Toast 元件。
// 使用 Redux 狀態管理。
// 使用 React Hook Form 來管理表單狀態和驗證。
// 使用 React Icons 來顯示圖示。
// 使用 React Router 來導向。
// 使用 React Redux 來管理狀態。
// 使用 React Hook Form 來管理表單狀態和驗證。
// 使用 React Icons 來顯示圖示。
// 使用 React Router 來導向。
// 使用 React Redux 來管理狀態。

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createAsyncMessage } from "../../slices/messageSlice";

function MessageToast() {

  // 使用 useDispatch 來發送 Redux 動作
  const dispatch = useDispatch();

  // 使用 useSelector 來取得 Redux 狀態管理中的 message 狀態
  const messages = useSelector((state) => state.message);

  // 使用 return 來返回 JSX 元素
  return (
    <div className="toast-container position-fixed top-0 end-0 p-3">
      {
        messages.map((message) => (
          <div 
            key={message.id}
            className="toast show"
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            <div 
              className={`toast-header text-white bg-${message.type}`}>
              <strong className="me-auto">{message.title}</strong>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="toast" 
                aria-label="Close" />
            </div>
            <div className="toast-body">{message.text}</div>
          </div>
        ))
      }
    </div>
  )
}

export default MessageToast;