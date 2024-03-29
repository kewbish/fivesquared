import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const Nav = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["login_cookie"]);
  const cookieName = "login_cookie";
  const navigate = useNavigate();

  useEffect(() => {
    if (!!cookies[cookieName]) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [cookies]);

  const onLogOutClick = () => {
    removeCookie(["login_cookie"]);
    makeToast('Logged out!');
  };

  const search = () => {
    if (searchTerm !== "") {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
  // a component library example: https://tailwindcomponents.com/component/responsive-navbar-2 . The code was not auto-generated, and we made significant
  // changes to the template to style it with our project's specific goals.
  return (
    <>
      <Toaster toastOptions={{ duration: 3000 }} />
      <nav className="flex items-center justify-between flex-wrap bg-white py-4 lg:px-12 shadow border-solid border-t-2 border-blue-500">
        <div className="flex justify-between lg:w-auto w-full lg:border-b-0 pl-6 pr-2 border-solid border-b-2 border-gray-300 pb-5 lg:pb-0">
          <div className="flex items-center flex-shrink-0 text-gray-800 mr-16">
            <a
              href="/posts"
              className="block text-xl mt-4 lg:inline-block lg:mt-0 hover:text-white px-4 py-2 rounded hover:bg-blue-500 mr-2"
            >
              Home
            </a>
            <a
              href="/visualizer"
              className="block text-xl mt-4 lg:inline-block lg:mt-0 hover:text-white px-4 py-2 rounded hover:bg-blue-500 mr-2"
            >
              Visualizer
            </a>
            <a
              href="/stats"
              className="block text-xl mt-4 lg:inline-block lg:mt-0 hover:text-white px-4 py-2 rounded hover:bg-blue-500 mr-2"
            >
              Stats
            </a>
              <a
              href="/advanced"
              className="block text-xl mt-4 lg:inline-block lg:mt-0 hover:text-white px-4 py-2 rounded hover:bg-blue-500 mr-2"
            >
              Advanced Search
            </a>
          </div>
        </div>

        <div className="menu w-full flex-grow lg:flex lg:items-center lg:w-auto lg:px-3 px-8">
          <div className="text-md font-bold text-blue-500 lg:flex-grow">
            {/* THIS IS WHERE WE WOULD PUT LINKS TO PAGES IF WE WANTED TO */}
            {/* <a href="/posts"
                   className="block mt-4 lg:inline-block lg:mt-0 hover:text-white px-4 py-2 rounded hover:bg-blue-500 mr-2">
                    Feed
                </a> */}
          </div>
          <div className="relative mx-auto text-gray-600 lg:block hidden">
            <input
              onKeyDown={handleKeyPress}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="border-2 border-gray-300 bg-white h-10 pl-2 pr-8 rounded-lg text-sm focus:outline-none"
              type="search"
              name="search"
              placeholder="Search"
            />
            <button
              onClick={search}
              type="submit"
              className="absolute right-0 top-0 mt-3 mr-2"
            >
              <svg
                className="text-gray-600 h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                id="Capa_1"
                x="0px"
                y="0px"
                viewBox="0 0 56.966 56.966"
                width="512px"
                height="512px"
              >
                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
              </svg>
            </button>
          </div>
          <div className="flex ">
            {!loggedIn ? (
              <a
                href="/login"
                className="block text-md px-4 py-2 rounded text-blue-500 ml-2 font-bold hover:text-white mt-4 hover:bg-blue-500 lg:mt-0"
              >
                Sign in
              </a>
            ) : (
              <></>
            )}
            {!loggedIn ? (
              <a
                href="/signup"
                className="block text-md px-4 py-2 rounded text-blue-500 ml-2 font-bold hover:text-white mt-4 hover:bg-blue-500 lg:mt-0"
              >
                Sign up
              </a>
            ) : (
              <></>
            )}
            {loggedIn ? (
              <a
                href={"/profile/" + cookies[cookieName]}
                className="block text-md px-4 py-2 rounded text-blue-500 ml-2 font-bold hover:text-white mt-4 hover:bg-blue-500 lg:mt-0 cursor:pointer"
              >
                {"Welcome, " + cookies[cookieName] + "!"}
              </a>
            ) : (
              <></>
            )}
            {loggedIn ? (
              <a
                onClick={onLogOutClick}
                className="block text-md px-4 py-2 rounded text-blue-500 ml-2 font-bold hover:text-white mt-4 hover:bg-blue-500 lg:mt-0 cursor:pointer"
              >
                Log out
              </a>
            ) : (
              <></>
            )}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Nav;

export function makeToast(message, success=true) {
  if (success) {
    toast.success(message);
  } else {
    toast.error(message)
  }
}
