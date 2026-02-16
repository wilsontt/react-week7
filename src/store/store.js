// 建立 Redux store 狀態管理
import { configureStore } from "@reduxjs/toolkit";

// 導入 reducer 來源切片
import messageReducer from '../slices/messageSlice';
import cartReducer from '../slices/cartSlice';
import authReducer from '../slices/authSlice'

// 將 reducer 來源切片加入 store
export const store = configureStore({
  reducer: {
    message: messageReducer, // 將訊息 reducer 來源切片加入 store
    cart: cartReducer,       // 將購物車 reducer 來源切片加入 store
    auth: authReducer,       // 將登入狀態 reducer 來源切片加入 store
  },
});

export default store;