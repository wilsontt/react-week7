// 客戶購物車切片
// 當按下加入購物車後，導覽列上的購物車數量 ＋ 1.
// 由 Cart 頁 / 加入購物車後 GET cart 同步進 Redux。
import { createSlice} from '@reduxjs/toolkit';


const cartSlice = createSlice(
  {
    name: 'cart',
    // 初始化購物車狀態
    initialState: {
      carts: [],
      total: 0,
      final_total: 0,
    },
    reducers: {
      /** 以 API GET cart 回傳的 data 覆寫整個購物車（Cart 頁 getCart、加入購物車後同步、可選 Navbar 初次載入） */
      setCart: (state, action) => {
        state.carts = action.payload.carts ?? [];
        state.total = action.payload.total ?? 0;
        state.final_total = action.payload.final_total ?? 0;
      },
      /** 加入購物車（Cart 頁 addCart） */
      addCart: (state, action) => {
        state.carts.push(action.payload);
      },
    },
  },
);

// 導出 addCart 動作
export const { setCart, addCart } = cartSlice.actions;

export default cartSlice.reducer;