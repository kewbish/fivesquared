import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import './Nav.css';
import { useCookies } from "react-cookie";
import { useState } from 'react';

const Nav = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
  const cookieName = 'login_cookie';

  useEffect(() => {
    if (!!cookies[cookieName]) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [cookies]);

  const onLogOutClick = () => {
    removeCookie(['login_cookie']);
  }

  return (
    <>  
      <div className="page-layout">
      <div className="navigation-bar">
        <a href="/posts">Posts</a>
        {loggedIn ? <a href={cookies[cookieName]}>Profile</a> : <></>}
        {!loggedIn ? <a href="/login">Log in</a> : <></>}
        {loggedIn ? <button onClick={onLogOutClick}>Log Out</button> : <></>}
      </div>

      <Outlet />
      </div>  
    </>
  )
};

export default Nav;