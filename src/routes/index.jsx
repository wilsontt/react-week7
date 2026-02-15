// 使用 useRoutes hook 管理路由表

import { useRoutes } from 'react-router-dom';

import { frontendRoutes } from './frontend';
import { AdminRoutes } from './admin';

import NotFound from '../pages/NotFound';

const AppRouter = (isAuth, setIsAuth) => {

  // 動態 import admin routes, 因為需要先取得 isAuth 狀態才能決定要引入哪個路由表
  const adminRoutes = AdminRoutes(isAuth, setIsAuth);

  // 將所有路由表合併成一個路由表
  return useRoutes([
    ...frontendRoutes,
    ...adminRoutes, 
    {
      path: '*',
      element: <NotFound />, // 404 頁面
    },
  ]);
};

export default AppRouter;