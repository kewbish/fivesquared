import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import './Nav.css';
import { useCookies } from "react-cookie";
import { useState } from 'react';
import Login from "../../components/login/Login";

const Nav = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
  const cookieName = 'login_cookie';

  const onLogInClick = async () => {
    setShowLogin(false);
    // This is a very janky solution, but the only quick way I could see to get the showLogin prop of Login to actually toggle,
    // thus actually triggering it to reopen if it has been closed. Happy to discuss better solutions at some point - Ziven
    await new Promise( res => setTimeout(res, 100) );
    setShowLogin(true);
  }

  useEffect(() => {
    setShowLogin(false);
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
        <a href="/failtest">404 Test</a>
        {!loggedIn ? <button onClick={onLogInClick}>Log In</button> : <></>}
        {loggedIn ? <button onClick={onLogOutClick}>Log Out</button> : <></>}
      </div>    

      <Outlet />
      <Login showLogin={showLogin}/>
      </div>  
    </>
  )
};

export default Nav;