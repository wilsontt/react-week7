import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from "react-router-dom";
import { HashRouter } from "react-router-dom";

// import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 

// 導入 Redux 狀態管理
import { Provider } from 'react-redux';
import { store } from './store/store';




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      {/* 將 App 用 Provider 包起來，讓 App 內的所有元件都能使用 Redux 狀態管理 */}
      <Provider store={store}>
        <App />
      </Provider>
    </HashRouter>
  </StrictMode>,
)
