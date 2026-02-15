// 後台管理路由設定 
import { Navigate } from "react-router-dom"; 
import ProtectedRoute from './ProtectedRoute'

import Login from '../admin/pages/Login'
import { AdminLayout } from './AdminLayout'
import ProductListPage from '../admin/pages/ProductListPage'
import ProductEditPage from '../admin/pages/ProductEditPage'
import OrderManagement from "../admin/pages/OrderManagement";


export const AdminRoutes = (isAuth, setIsAuth) => [
  {
    path: '/admin',
    element: <AdminLayout />, // 統一的後台佈局（含側邊欄、權限檢查）
    children: [
      {
        index: true,
        element: <Navigate to = {
          isAuth ? "/Admin/ProductListPage" : "/Admin/Login"
        } replace />, // 重定向到 ProductListPage 或 Login 頁面
      }, 
      {
        path: 'Login',
        element: <Login setIsAuth={setIsAuth} />, 
      },
      {
        path: 'ProductListPage',
        element: (
          <ProtectedRoute isAuth={isAuth}>
            <ProductListPage /> 
          </ProtectedRoute>
        ),
      },
      {
        path: 'productEditPage',
        element: (
          <ProtectedRoute isAuth={isAuth}>
            <ProductEditPage />  
          </ProtectedRoute>
                    
        ),
      },
      {
        path: 'OrderManagement',
        element: (
          <ProtectedRoute isAuth={isAuth}>
            <OrderManagement />  
          </ProtectedRoute>
                    
        ),
      },
    ],
  },
];