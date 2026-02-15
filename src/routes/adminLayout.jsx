// 後台版面，用於渲染子路由的 Outlet

import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return <Outlet />;
}