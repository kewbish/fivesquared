import {useParams, useSearchParams} from 'react-router-dom';
import { useCookies } from "react-cookie";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileResultCard from '../../components/profileResultCard/ProfileResultCard';
import PieceResultCard from '../../components/pieceResultCard/pieceResultCard';
import CollectionResultCard from "../../components/collectionResultCard/collectionResultCard";
import ArtistResultCard from '../../components/artistResultCard/artistResultCard';
import MuseumResultCard from "../../components/locationResultCard/museumResultCard";
import GalleryResultCard from "../../components/locationResultCard/galleryResultCard";
import PrivateCollectionResultCard from "../../components/locationResultCard/privateCollectionResultCard";

const SearchResults = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["login_cookie"]);
  const [searchParam] = useSearchParams();
  const [profileResults, setProfileResults] = useState([]);
  const [pieceResults, setPieceResults] = useState([]);
  const [collectionResults, setCollectionResults] = useState([]);
  const [museumResults, setMuseumResults] = useState([]);
  const [galleryResults, setGalleryResults] = useState([]);
  const [privateCollectionResults, setPrivateCollectionResults] = useState([]);

  const [artistResults, setArtistResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const term = searchParam.get("q").toUpperCase();
    const fetchProfiles = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/profiles/${term}`, {
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
        const response = await fetch(`http://localhost:65535/search/pieces/${term}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("Pieces PJSON:", pjson);
        if (pjson.pieces) {
          setPieceResults(pjson.pieces);
        }
      }
    };

    const fetchCollections = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/collections/${term}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("Collection PJSON:", pjson);
        if (pjson.collections) {
          setCollectionResults(pjson.collections);
        }
      }
    };

    const fetchLocations = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/locations/${term}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("Location PJSON:", pjson);
        if (pjson.locations) {
          setMuseumResults(pjson.locations.museums);
          setGalleryResults(pjson.locations.galleries);
          setPrivateCollectionResults(pjson.locations.privateCollections);
        }
      }
    };

    const fetchArtists = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/search/artists/${term}`, {
          method: "GET",
        });
        const pjson = await response.json();
        console.log("Artists PJSON:", pjson);
        if (pjson.artists) {
          setArtistResults(pjson.artists);
        }
      }
    };

    fetchProfiles();
    fetchPieces();
    fetchCollections();
    fetchLocations();
    fetchArtists();
    // window.location.reload();
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
  } else if (profileResults.length + pieceResults.length + collectionResults.length + museumResults.length + galleryResults.length + privateCollectionResults.length + artistResults.length > 0) {
    return (
      <div >
        {profileResults.length > 0 ? <body className="px-10 py-20 gap-5">   <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Profile Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {profileResults.map((profile) => (
              <ProfileResultCard profileData={profile} />
            ))}

          </div> </body> : <></>}
        {pieceResults.length > 0 ? <body className="px-10 py-5 gap-5">
          <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Art Piece Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {pieceResults.map((piece) => (
              <PieceResultCard pieceData={piece} />
            ))}

          </div>
        </body> : <></>}
        {artistResults.length > 0 ? <body className="px-10 py-5 gap-5">
          <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Artist Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {artistResults.map((artist) => (
              <ArtistResultCard artistData={artist} />
            ))}

          </div>
        </body> : <></>}
        {collectionResults.length > 0 ? <body className="px-10 py-5 gap-5">
          <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Collection Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {collectionResults.map((collection) => (
              <CollectionResultCard collectionData={collection} />
            ))}

          </div>
        </body> : <></>}
        {museumResults.length + galleryResults.length + privateCollectionResults.length > 0 ? <body className="px-10 py-5 gap-5">
          <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Location Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
            {museumResults.map((museum) => (
              <MuseumResultCard museumData={museum} />
            ))}
            {galleryResults.map((gallery) => (
              <GalleryResultCard galleryData={gallery} />
            ))}
            {privateCollectionResults.map((privateCollection) => (
              <PrivateCollectionResultCard privateCollectionData={privateCollection} />
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
