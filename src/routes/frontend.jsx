// 前台路由設定 

import Home from "../pages/Home";
import About from "../pages/About";
import ProductList from "../pages/ProductList";
import Cart from "../pages/Cart";


export const frontendRoutes = [
  {
    path: '/',
    element: <Home />, // 首頁
  },
  {
    path: '/about',
    element: <About />, // 關於我們
  },
  {
    path: '/productList',
    element: <ProductList />, // 產品列表
  },
  {
    path: '/cart',
    element: <Cart />, // 客戶購物車
  },
];