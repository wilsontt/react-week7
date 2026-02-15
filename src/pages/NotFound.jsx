import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router';


const NotFound = () => {
  return (
    <>
      <div className="container text-center" style={{ marginTop: '50px' }}>
        <h1>404 Page Not Found 找不到這個網頁</h1>
        <img src="./notFoundImage.png" alt="404 Not Found" className="img-fluid mt-3 w-25" />
        <p>請檢查您的網址是否正確</p>
        <hr />
        <Link to="/" className="btn btn-primary btn-lg shadow-sm hover-effect">
          <FaHome className="me-2 text-white" size={24} />回首頁
        </Link>
      </div>
    </>
  )
}

export default NotFound;