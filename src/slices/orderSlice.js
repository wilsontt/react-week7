/**
 * @file orderSlice.js
 * @description 後台訂單管理 Redux 切片
 *
 * 目的：集中管理訂單列表、分頁，供 OrderManagement 頁面使用。
 * 資料來源：後端 API GET /api/{path}/admin/orders，需 admin token。
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    pagination: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOrdersAsync.fulfilled, (state, action) => {
      const payload = action.payload ?? { orders: [], pagination: {} };
      state.orders = payload.orders ?? [];
      state.pagination = payload.pagination ?? {};
    });
  },
});

/**
 * 非同步取得訂單列表
 * @param {number} [page=1] - 分頁
 * @returns {Promise<Object>} { orders, pagination }
 */
export const getOrdersAsync = createAsyncThunk(
  'order/getOrders',
  async (page = 1) => {
    const res = await axios.get(
      `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/orders?page=${page}`
    );
    const orders = res.data?.orders ?? [];
    // 除錯：確認 API 回傳的訂單結構（Hexschool POST /order 可能不持久化 is_paid）
    if (orders.length > 0) {
      const first = orders[0];
      console.log('訂單 API 回傳:', {
        id: first.id,
        is_paid: first.is_paid,
        'typeof is_paid': typeof first.is_paid,
        keys: Object.keys(first),
      });
    }
    return {
      orders,
      pagination: res.data?.pagination ?? {},
    };
  }
);

/**
 * 非同步刪除訂單，成功後重新取得當前頁列表
 * API: DELETE /v2/api/{api_path}/admin/order/{id}（單數 order）
 */
export const deleteOrderAsync = createAsyncThunk(
  'order/deleteOrder',
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      await axios.delete(`${VITE_API_BASE}/api/${VITE_API_PATH}/admin/order/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? '訂單刪除失敗';
      return rejectWithValue({ message: msg });
    }
    const page = getState().order.pagination?.current_page ?? 1;
    await dispatch(getOrdersAsync(page));
  }
);

/**
 * 非同步更新訂單，成功後重新取得當前頁列表
 * API: PUT /v2/api/{api_path}/admin/order/{id}（單數 order）
 * Body: { data: { create_at, is_paid, message, products, user, num } }
 */
export const updateOrderAsync = createAsyncThunk(
  'order/updateOrder',
  async ({ id, data }, { dispatch, getState, rejectWithValue }) => {
    const url = `${VITE_API_BASE}/api/${VITE_API_PATH}/admin/order/${id}`;
    try {
      await axios.put(url, { data: data ?? {} });
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? '訂單更新失敗';
      return rejectWithValue({ message: msg });
    }
    const page = getState().order.pagination?.current_page ?? 1;
    await dispatch(getOrdersAsync(page));
  }
);

export default orderSlice.reducer;
