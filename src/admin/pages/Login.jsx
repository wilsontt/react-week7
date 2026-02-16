import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";

import { login } from '../../slices/authSlice';
import { createAsynceMessage } from '../../slices/messageSlice';
import { useDispatch } from 'react-redux';

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
// const API_PATH = import.meta.env.VITE_API_PATH; // 保留供未來使用


function Login({ setIsAuth }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 使用 React HookForm 來管理表單狀態和驗證
    const { 
      register,               // 用來註冊表單欄位
      handleSubmit,           // 用來提交表單, 當表單驗證成功時，會調用 onSubmit 函數。
      formState: { errors, isValid },  // 表單錯誤
    } = useForm({             // 使用 useForm 鉤子，設定運作方式為 onSubmit
      mode: "onChange",       // 設定表單驗證模式為 onChange，當表單欄位有變化時，才進行驗證
      defaultValues: {        // 設定預設值
        username: '', 
        password: '',
      },
    });     
    // console.log(errors);    // 印出表單錯誤

    // 登入成功後 將 Token 寫到 Cookie 中，並設定 axios 的 default headers，並設置 token。
    const [loginResult, setLoginResult] = useState(null);
    useEffect(() => {
      if (!loginResult) return;
        document.cookie = `hexToken=${loginResult.token}; expires=${new Date(loginResult.expired)};`;
        axios.defaults.headers.common.Authorization = loginResult.token;
    }, [loginResult]);

    const onLoginSubmit = async(formData) => {
      try {
        // 發送登入請求，並取得 token。
        const response = await axios.post(`${API_BASE}/admin/signin`, formData);
        const { token, expired } = response.data;
        // console.log('登入成功', response.data);

        // 設定 token 到 state，並設定登入狀態為 true，並跳轉到產品列表頁面。
        setLoginResult({ token, expired });
        setIsAuth(true);
        dispatch(login({ token, expired }));
        dispatch(createAsynceMessage({
          success: true,
          message: "登入成功",
        }))
        navigate("/admin/productListPage");

      } catch (error) {
        setIsAuth(false); // 登入失敗，設置登入狀態為 false
        console.error('登入失敗，錯誤訊息：', error);
        dispatch(createAsynceMessage({
          success: false,
          message: "登入失敗，請重新確認你的帳號、密碼是否正確。",
        }));
        // 使用 alert 顯示錯誤訊息
        // window.alert('登入失敗，請重新確認你的帳號、密碼是否正確。');
        // if (axios.isAxiosError(error) && error.response) {
        //   console.error('登入失敗，錯誤訊息：', error.response);
        // } else {
        //   console.error('登入失敗，錯誤訊息：', error);
        // }
      }
    };

    // 儲存登入表單資料，使用 useState 儲存表單資料 
    // const [formData, setFormData] = useState({
    //     username: '',
    //     password: '',
    // });

    return (
        <>
          {/* 登入表單 */}
            <div className="container mt-5 mx-auto rounded-3" style={{ maxWidth: "28rem" }}>
                <h2 className="mb-3 font-weight-normal text-center">Please Login 請先登入</h2>
                <form className="form-floating w-100 px-3" onSubmit={handleSubmit(onLoginSubmit)}>
                    <div className="form-floating mb-2">
                        <input
                            type="email"
                            className="form-control w-100 text-start"
                            name="username"
                            placeholder="name@example.com"
                            // React Hook Form 表單驗證規則：設定表單欄位的驗證規則。
                            {...register("username", {
                              required: "請輸入 EMAIL",
                              pattern: {
                                value:/^\S+@\S+$/i, 
                                message: "EMAIL 格式不正確",
                              },
                            })}
                            title="請輸入 EMAIL 帳號"
                            // value={formData.username}
                            // onChange={(e) => handleInputChange(e)}
                            // required
                            // autoComplete="email"
                        />
                        <label htmlFor="username">Email address</label>
                        {errors.username && <p className="text-danger">{errors.username.message}</p>}
                    </div>
                    <div className="form-floating mb-2">
                        <input
                            type="password"
                            className="form-control w-100 text-start"
                            name="password"
                            placeholder="Password"
                            // React Hook Form 表單驗證規則：設定表單欄位的驗證規則。
                            {...register("password", {
                              required: "請輸入密碼",
                              minLength: {
                                value: 10,
                                message: "密碼長度至少 10 碼",
                              },
                            })}
                            title="請輸入密碼"
                            // value={formData.password}
                            // onChange={(e) => handleInputChange(e)}
                            // required
                            // autoComplete="current-password"
                        />
                        <label htmlFor="password">Password</label>
                        {errors.password && <p className="text-danger">{errors.password.message}</p>}
                      </div>
                      <button 
                        className="w-100 mb-3 btn btn-lg btn-primary" 
                        type="submit"
                        disabled={!isValid}
                      >
                        Login 登入
                      </button>
                </form>
            </div>
        </>
    );
}

export default Login;