import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {useCookies} from "react-cookie";
import {useEffect, useState} from 'react';
import ProfileResultCard from '../../components/profileResultCard/ProfileResultCard';
import PieceResultCard from '../../components/pieceResultCard/pieceResultCard';
import LocationResultCard from "../../components/locationResultCard/locationResultCard";
import CollectionResultCard from "../../components/collectionResultCard/collectionResultCard";
import ArtistResultCard from '../../components/artistResultCard/artistResultCard';

const AdvancedSearchResults = () => {
    const [cookies, setCookie, removeCookie] = useCookies(["login_cookie"]);
    const [searchParam] = useSearchParams();
    const [profileResults, setProfileResults] = useState([]);
    const [pieceResults, setPieceResults] = useState([]);
    const [collectionResults, setCollectionResults] = useState([]);
    const [locationResults, setLocationResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const navigate = useNavigate();

    function parseString(key) {
        return searchParam.get(key) ? searchParam.get(key).split(" ").join("_") : "\%00"
    }

    function parseDate(key) {
        return isNaN(Date.parse(searchParam.get(key))) ? "\%00" : searchParam.get(key).toString();
    }

    function parseNumber(key) {
        return searchParam.get(key) ? searchParam.get(key) : "\%00";
    }

    useEffect(() => {
        const fetchPieces = async () => {
            const title = parseString("ap-title");
            const artist = parseString("ap-artist");
            const medium = parseString("ap-med");
            const col = parseString("ap-col");
            const cur = parseString("ap-cur");
            const loc = parseString("ap-loc");
            const desc = parseString("ap-desc");
            const lo = parseNumber("ap-lo");
            const hi = parseNumber("ap-hi");

            const terms = [title, artist, medium, col, cur, loc, lo, hi, desc].join("/");
            console.log(terms);

            if (cookies['login_cookie']) {
                const response = await fetch(`http://localhost:65535/advanced/search/pieces/${terms}`, {
                    method: "GET",
                });
                const pjson = await response.json();
                console.log("Pieces PJSON:", pjson);
                if (pjson.pieces) {
                    setPieceResults(pjson.pieces);
                }
            }
        };

        const fetchArtists = async () => {
            const name = parseString("a-name");
            const desc = parseString("a-desc");
            const dob = parseDate("a-dob");
            const dod = parseDate("a-dod");

            const terms = [name, desc, dob, dod].join("/");
            console.log(terms);

            if (cookies['login_cookie']) {
                const response = await fetch(`http://localhost:65535/advanced/search/artists/${terms}`, {
                    method: "GET",
                });
                const pjson = await response.json();
                console.log("Artists PJSON:", pjson);
                if (pjson.artists) {
                    setArtistResults(pjson.artists);
                }
            }
        };

        const fetchCollections = async () => {
            const title = parseString("c-title");
            const cur = parseString("c-cur");
            const theme = parseString("c-theme");
            const loc = parseString("c-loc");
            const desc = parseString("c-desc");

            const terms = [title, cur, theme, loc, desc].join("/");
            console.log(terms);


            if (cookies['login_cookie']) {
                const response = await fetch(`http://localhost:65535/advanced/search/collections/${terms}`, {
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
            const name = parseString("l-name");
            const earl = parseNumber("l-earl");
            const late = parseNumber("l-late");
            const addr = parseString("l-addr");
            const city = parseString("l-city");
            const regn = parseString("l-regn");
            const ctry = parseString("l-ctry");
            const post = parseString("l-post");

            const terms = [name, earl, late, addr, city, regn, ctry, post].join("/");
            console.log(terms);

            if (cookies['login_cookie']) {
                const response = await fetch(`http://localhost:65535/advanced/search/locations/${terms}`, {
                    method: "GET",
                });
                const pjson = await response.json();
                console.log("Location PJSON:", pjson);
                if (pjson.locations) {
                    setLocationResults(pjson.locations);
                }
            }
        };

        fetchPieces();
        fetchArtists();
        fetchCollections();
        fetchLocations();
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
    } else if (profileResults.length + pieceResults.length + collectionResults.length + locationResults.length + artistResults.length > 0) {
        return (
            <div>
                {profileResults.length > 0 ? <body className="px-10 py-20 gap-5"><h2
                    className="text-xl font-semibold sm:text-2xl mb-4 text-center">Profile Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {profileResults.map((profile) => (
                        <ProfileResultCard profileData={profile}/>
                    ))}

                </div>
                </body> : <></>}
                {pieceResults.length > 0 ? <body className="px-10 py-5 gap-5">
                <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Art Piece Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {pieceResults.map((piece) => (
                        <PieceResultCard pieceData={piece}/>
                    ))}

                </div>
                </body> : <></>}
                {artistResults.length > 0 ? <body className="px-10 py-5 gap-5">
                <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Artist Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {artistResults.map((artist) => (
                        <ArtistResultCard artistData={artist}/>
                    ))}

                </div>
                </body> : <></>}
                {collectionResults.length > 0 ? <body className="px-10 py-5 gap-5">
                <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Collection Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {collectionResults.map((collection) => (
                        <CollectionResultCard collectionData={collection}/>
                    ))}

                </div>
                </body> : <></>}
                {locationResults.length > 0 ? <body className="px-10 py-5 gap-5">
                <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-center">Location Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {locationResults.map((location) => (
                        <LocationResultCard locationData={location}/>
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

export default AdvancedSearchResults;
