// 共用元件 導覽列
import { useState, useRef, useEffect } from "react";
import { data, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHome, FaList, FaEdit, FaShieldAlt, FaInfo, FaShoppingCart, FaClipboardList, FaTag, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { DateTimeDisplay } from "../CalendarIcon";
import * as bootstrap from "bootstrap";

// 導入 Redux 狀態管理, 使用 useSelector 來取得購物車狀態
import { useSelector } from 'react-redux';
// import { useDispatch } from 'react-redux';


/** 前台主要選單（不含後台） */
const mainMenuItems = [
  { id: "home", label: "首頁", icon: FaHome, path: "/" },
  { id: "about", label: "關於我們", icon: FaInfo, path: "/about" },
  { id: "ProductList", label: "產品列表", icon: FaList, path: "/ProductList" },
  { id: "Cart", label: "客戶購物車", icon: FaShoppingCart, path: "/Cart" },
];

/**
 * 後台管理選單：登入後顯示下拉（產品列表、產品編輯、訂單管理、優惠券等）
 * children 為下拉項目，path 為未登入時點擊「後台管理」的登入頁
 */
const adminMenu = {
  id: "Admin",
  label: "後台管理",
  icon: FaShieldAlt,
  path: "/Admin/Login",
  children: [
    { label: "產品列表", path: "/Admin/ProductListPage", icon: FaList },
    { label: "產品編輯", path: "/Admin/ProductEditPage", icon: FaEdit },
    { label: "客戶訂單管理", path: "/Admin/OrderManagement", icon: FaClipboardList, disabled: false },
    { label: "優惠券管理", path: "#", icon: FaTag, disabled: true },
  ],
};

export default function Navbar({ isAuth = false, setIsAuth }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const authDropdownRef = useRef(null);
  const navbarCollapseRef = useRef(null);

  // 使用 useSelector 來取得購物車狀態
  const cartCount = useSelector((state) =>
    (state.cart.carts ?? []).reduce((sum, item) =>
      sum + (Number(item.qty ?? 0)), 0));

  /** 點擊元件外時關閉後台管理下拉 */
  useEffect(() => {
    if (!isAuth) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isAuth]);

  /** 點擊元件外時關閉登入/登出下拉 */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /** 行動裝置：點選選單項目後收合漢堡選單 */
  const closeNavbarCollapse = () => {
    const el = navbarCollapseRef.current;
    if (!el) return;
    const collapse = bootstrap.Collapse.getInstance(el) ?? new bootstrap.Collapse(el, { toggle: false });
    collapse.hide();
  };

  /** 登出：清除 Cookie、axios 表頭並導向首頁 */
  const handleLogout = () => {
    document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    delete axios.defaults.headers.common.Authorization;
    setIsAuth?.(false);
    setAuthDropdownOpen(false);
    closeNavbarCollapse();
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light rounded mb-3" style={{ position: "static" }}>
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center py-0">
          <FaShieldAlt className="me-2 text-primary" size={24} />
          <div>
            <div className="fw-bold">花的世界</div>
            <small className="text-muted">商品管理系統</small>
          </div>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="切換選單"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarMain" ref={navbarCollapseRef}>
          <ul className="navbar-nav flex-grow-1 justify-content-center flex-wrap gap-1 gap-md-0">
            {mainMenuItems.map((item, index) => (
              <li key={item.id} className="nav-item d-flex align-items-center">
                <Link to={item.path} className="nav-link d-flex align-items-center text-dark" onClick={closeNavbarCollapse}>
                  <item.icon className="me-2 text-warning" size={24} />
                  {item.label}
                </Link>
                {(index < mainMenuItems.length - 1 || isAuth) && (
                  <span className="d-none d-md-inline text-muted mx-2">|</span>
                )}
              </li>
            ))}
            {/* 後台管理：僅已登入時顯示，為下拉選單（產品列表、產品編輯等） */}
            {isAuth && (
              <li
                className="nav-item d-flex align-items-center dropdown"
                ref={dropdownRef}
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  className="nav-link dropdown-toggle d-flex align-items-center text-dark border-0 bg-transparent"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                >
                  <adminMenu.icon className="me-2 text-warning" size={24} />
                  {adminMenu.label}
                </button>
                <ul
                  className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
                  style={{ top: "100%", left: 0, zIndex: 1050, marginTop: 0 }}
                >
                  {adminMenu.children.map((child) => (
                    <li key={child.path + child.label}>
                      <Link
                        to={child.path}
                        className={`dropdown-item d-flex align-items-center ${child.disabled ? "disabled" : ""}`}
                        aria-disabled={child.disabled}
                        onClick={(e) => {
                          if (child.disabled) e.preventDefault();
                          else {
                            setDropdownOpen(false);
                            closeNavbarCollapse();
                          }
                        }}
                      >
                        <child.icon className="me-2" size={18} />
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
          {/* 購物車數量（Redux）＋ 日期時間元件作為下拉觸發，下拉選單為登入/登出 */}
          <div className="position-relative d-flex align-items-center" ref={authDropdownRef}>
            <span className="position-relative d-inline-flex me-2">
              <FaShoppingCart className="me-2 text-primary" size={18} />
              {cartCount > 0 ? (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  {cartCount}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="btn btn-link nav-link text-dark p-0 d-flex align-items-center dropdown-toggle text-decoration-none"
              aria-expanded={authDropdownOpen}
              aria-haspopup="true"
              onClick={(e) => {
                e.stopPropagation();
                setAuthDropdownOpen((prev) => !prev);
              }}
            >
              <DateTimeDisplay showCalendarIcon={true} />
            </button>
            <ul
              className={`dropdown-menu dropdown-menu-end ${authDropdownOpen ? "show" : ""}`}
              style={{ top: "100%", right: 0, left: "auto", zIndex: 1050, marginTop: "2px" }}
            >
              {isAuth ? (
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" size={18} />
                    登出
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    to="/Admin/Login"
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      setAuthDropdownOpen(false);
                      closeNavbarCollapse();
                    }}
                  >
                    <FaSignInAlt className="me-2" size={18} />
                    登入
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}