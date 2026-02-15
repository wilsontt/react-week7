import { Link } from "react-router-dom";
import { FaLeaf, FaShoppingBag, FaInfoCircle } from "react-icons/fa";

function Home() {
  return (
    <div
      className="container-fluid text-center mt-5"
      style={{ marginTop: "50px", marginBottom: "50px" }}
    >
      <h2 className="mb-2">
        <FaLeaf className="text-success me-2" />歡迎光臨 花的世界
      </h2>
      <p className="text-muted mb-4">嚴選花卉，傳遞心意</p>

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
        <Link to="/ProductList" className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2">
          <FaShoppingBag size={20} />逛逛產品
        </Link>
        <Link to="/about" className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center gap-2">
          <FaInfoCircle size={20} />認識我們
        </Link>
      </div>

      <p className="small text-muted mb-0">
        <FaLeaf className="me-1 text-success" />品質把關 · 安心配送 · 貼心服務
      </p>
    </div>
  );
}

export default Home;