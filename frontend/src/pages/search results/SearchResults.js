import { useParams } from 'react-router-dom'
import { useCookies } from "react-cookie";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileResultCard from '../../components/profileResultCard/ProfileResultCard';
import PieceResultCard from '../../components/pieceResultCard/pieceResultCard';

const SearchResults = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["login_cookie", "param_cookie"]);
  // we could have different lists for the results of different search types (collection, artwork, profile, etc.)
  const [profileResults, setProfileResults] = useState([]);
  const [pieceResults, setPieceResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/profiles/${cookies['param_cookie']}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("PJSON:", pjson);
        if (pjson.profile) {
          setProfileResults(pjson.profile);
        }
      }
    };

    const fetchPieces = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/pieces/${cookies['param_cookie']}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("Pieces PJSON:", pjson);
        if (pjson.pieces) {
          setPieceResults(pjson.pieces);
        }
      }
    };

    fetchProfiles();
    fetchPieces();
  }, [cookies]);

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
  } else if (profileResults.length > 0 || pieceResults.length > 0) {
    return (
      <div >
        {profileResults.length > 0 ? <body class="px-10 py-20 gap-5">   <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Profile Results</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {profileResults.map((profile) => (
              <ProfileResultCard profileData={profile} />
            ))}

          </div> </body> : <></>}
        {pieceResults.length > 0 ? <body class="px-10 py-5 gap-5">
          <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Art Piece Results</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {pieceResults.map((piece) => (
              <PieceResultCard pieceData={piece} />
            ))}

          </div>
        </body> : <></>}      

      </div>
    );
  } else {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800">
          No results. Try searching for something else...
        </h2>
      </div>
    );
  }


};

export default SearchResults;