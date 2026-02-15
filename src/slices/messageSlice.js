import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const messageSlice = createSlice({
    name: 'message',
    initialState: [
      // {
      //   id: 1, 
      //   type: 'success',
      //   title: '成功',
      //   text: '這是一個成功訊息',
      // }
    ],
    reducers: {
      createMessage(state, action) {
        state.push({
          id: action.payload.id,
          type: action.payload.success ? 'success' : 'danger',
          title: action.payload.success ? '成功' : '錯誤',
          text: action.payload.message,
        })
      },
      removeMessage(state, action) {
        const index = state.findIndex((item) => item.id === action.payload);
        if (index !== -1) {
          // 利用陣列移除 指定位置的移除方法 splice(起始位置, 移除數量)
          state.splice(index, 1);
        }
      },
    }
  });

  // 使用 createAsyncThunk 來建立非同步的 action, 自動關閉訊息。
  export const createAsynceMessage = createAsyncThunk( 
    'message/createAsynceMessage', 
    async (payload, { dispatch, requestId }) => {
      // 發送 createMessage 動作，並傳入 payload 和 requestId
      dispatch(createMessage({
        ...payload, 
        id: requestId,
      }));

      // 使用 setTimeout 2秒後自動關閉訊息：removeMessage 動作，並傳入 requestId
      setTimeout(() => {
        dispatch(removeMessage(requestId));
      }, 3000);
    },
  );

  // 導出 createMessage
  export const { createMessage, removeMessage } = messageSlice.actions;

  export default messageSlice.reducer; // 導出 messageSlice reducer