import { Outlet, Link } from "react-router-dom";
import './Nav.css';

const Nav = () => {
  return (
    <>  
      <div className="page-layout">
      <div className="navigation-bar">
        <a href="/posts">Posts</a>
        <a href="/failtest">404 Test</a>
      </div>    

      <Outlet />
      </div>  
    </>
  )
};

export default Nav;