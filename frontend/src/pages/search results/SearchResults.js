import { useParams } from 'react-router-dom'
import { useCookies } from "react-cookie";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileResultCard from '../../components/profileResultCard/ProfileResultCard';

const SearchResults = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["login_cookie"]);
  // we could have different lists for the results of different search types (collection, artwork, profile, etc.)
  const [profileResults, setProfileResults] = useState([]);
  const { term } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/profiles/${term}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("PJSON:", pjson);
        setProfileResults(pjson.profile);
      }
    };

    fetchProfiles();
  }, []);

  const goToLogin = () => {
    navigate("/login");
  }

  if (!cookies.login_cookie) {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800 cursor-pointer" onClick={goToLogin}>
          Log in to search.
        </h2>
      </div>
    );
  } else if (profileResults) {
    return (
      <div >
        {/* We can have different sections on this page, the below div for profiles, 
            one for art pieces, etc. Such that the different things are all displayed on this page 
            in separate vertical chunks. */}
        <body class="px-10 py-20">
        <h2 className="text-xl font-semibold sm:text-2xl margin-bottom: 10px">Profile Results:</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {profileResults.map((profile) => (
              <ProfileResultCard profileData={profile} />
            ))}

          </div>
        </body>
      </div>
    );
  } else {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800">
          Checking on that for you...
        </h2>
      </div>
    );
  }


};

export default SearchResults;