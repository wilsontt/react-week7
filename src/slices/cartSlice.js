/**
 * @file cartSlice.js
 * @description 客戶購物車 Redux 切片
 *
 * 目的：管理購物車全域狀態，供 Cart 頁、Navbar、加入購物車流程共用。
 * 資料來源：後端 API GET /api/cart，由 getCartAsync 非同步取得並寫入 state。
 *
 * 使用時機：
 * - Cart 頁初次載入、更新數量、刪除項目、清空購物車後
 * - 加入購物車後（可選 Navbar 購物車數量同步）
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

/**
 * 購物車切片
 * @module cartSlice
 */
const cartSlice = createSlice({
  name: 'cart',
  /** 購物車 state 結構：carts 為商品陣列，total / final_total 為金額 */
  initialState: {
    carts: [],
    total: 0,
    final_total: 0,
  },
  reducers: {
    /**
     * 以 payload 覆寫整個購物車 state
     * @param {Object} state - 當前 cart state
     * @param {Object} action - Redux action，payload 為 { carts, total, final_total } 或 carts 陣列
     */
    setCart: (state, action) => {
      state.carts = action.payload;
    },
  },
  /**
   * 處理 getCartAsync 非同步結果，將 API 回傳資料寫入 state
   */
  extraReducers: (builder) => {
    builder.addCase(getCartAsync.fulfilled, (state, action) => {
      const data = action.payload ?? { carts: [], total: 0, final_total: 0 };
      state.carts = data.carts ?? [];
      state.total = data.total ?? 0;
      state.final_total = data.final_total ?? 0;
    });
  },
});

/**
 * 非同步取得購物車列表
 * @description 呼叫 GET /api/cart，成功後由 extraReducers 寫入 state
 * @returns {Promise<Object>} res.data.data，結構為 { carts, total, final_total }
 * @example dispatch(getCartAsync())
 */
export const getCartAsync = createAsyncThunk(
  'cart/getCart',
  async () => {
    try {
      const res = await axios.get(`${VITE_API_BASE}/api/${VITE_API_PATH}/cart`);
      // console.log('getCartAsync:', res.data.data);
      return res.data.data;
    } catch (error) {
      console.error('取得購物車失敗:', error);
      return error.response?.data;
    }
  }
);

// 加入 Navbar 購物車數量同步
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (data, {dispatch}) => {
    try {
      const res = await axios.post(`${VITE_API_BASE}/api/${VITE_API_PATH}/cart`, {data});
      // console.log('addToCartAsync:', res.data);
      dispatch(getCartAsync());
      // return res.data.data;
    } catch (error) {
      console.error('加入購物車失敗:', error);
      // return error.response.data;
    }
  },
);


export const { setCart } = cartSlice.actions;

export default cartSlice.reducer;