// 將登入狀態儲存到 Redux 中，使用 useSelector 來取得登入狀態
// 新增 src/slices/authSlice.js：state 含 isAuth、必要時 token；actions：login、logout。 

import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({ 
  name: 'auth',
  initialState: {
    isAuth: false,
    token: null,
  },
  reducers: {
    login: (state, action) => {
      state.isAuth = true;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuth = false;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;