import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/common/Navbar";

import MessageToast from "./components/common/MessageToast";
import AppRoutes from "./routes";


/** 從 Cookie 取得 hexToken 值（重整後還原 API 認證用） */
function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/hexToken=([^;]+)/);
  return match ? match[1].trim() : null;
}

/** 從 Cookie 檢查是否已有 hexToken（登入狀態） */
function getInitialAuth() {
  return !!getTokenFromCookie();
}

function App() {
  const [isAuth, setIsAuth] = useState(getInitialAuth);

  /** 重整後從 Cookie 還原 token 到 axios，避免後台 API 401 */
  useEffect(() => {
    const token = getTokenFromCookie();
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
  }, []);

  // 建立路由表, 傳入 isAuth 和 setIsAuth 狀態
  const routes = AppRoutes(isAuth, setIsAuth);

  return (
    <div className="App">
      {/* 導覽列：桌機橫向、行動裝置漢堡選單；登入後顯示後台下拉選單 */}
      <Navbar isAuth={isAuth} setIsAuth={setIsAuth} />
      <div
        className="container-fluid min-vh-100 d-flex flex-column px-4 px-md-5"
        style={{ marginTop: '15px', maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <MessageToast />
        {routes}
      </div>
      {/* 頁尾區塊 */}
      <footer className="bg-dark text-center text-lg-start mt-auto">
        <div className="text-center p-3">
          <small className="text-white">Copyright &copy; Wilson 威爾森 2026 | </small>
          <small className="text-white">All rights reserved | </small>
          <small className="text-white">服務信箱: <a href="mailto:wilson.tzo@gmail.com" className="text-white">wilson.tzo@gmail.com</a></small>
        </div>
      </footer>
    </div>      
  )
}

export default App
