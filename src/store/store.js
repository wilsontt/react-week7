// 建立 Redux store 狀態管理
import { configureStore } from "@reduxjs/toolkit";

// 導入 reducer 來源切片
import messageReducer from '../slices/messageSlice';
import cartReducer from '../slices/cartSlice';
import authReducer from '../slices/authSlice';
import orderReducer from '../slices/orderSlice';

// 將 reducer 來源切片加入 store
export const store = configureStore({
  reducer: {
    message: messageReducer, // 將訊息 
    cart: cartReducer,       // 將購物車 
    auth: authReducer,       // 將登入狀態 
    order: orderReducer,     // 後台訂單管理
  },
});

export default store;