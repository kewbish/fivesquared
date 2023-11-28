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

    useEffect(() => {
        // const searchType = () => {
        //     if (searchParam.has("p-user")) return 1;
        //     if (searchParam.has("a-name")) return 2;
        //     if (searchParam.has("ap-title")) return 3;
        //     if (searchParam.has("c-title")) return 4;
        //     if (searchParam.has("l-name")) return 5;
        //     else return 0;
        // }

        // const fetchProfiles = async () => {
        //     const url = `http://localhost:65535/advanced-search/profiles?p=${}`
        //     if (cookies['login_cookie']) {
        //         const response = await fetch(url, {
        //             method: "GET",
        //         });
        //         const pjson = await response.json();
        //         console.log("PJSON:", pjson);
        //         if (pjson.profile) {
        //             setProfileResults(pjson.profile);
        //         }
        //     }
        // };

        // const fetchPieces = async () => {
        //     if (cookies['login_cookie']) {
        //         const response = await fetch(`http://localhost:65535/search/pieces/${term}`, {
        //             method: "GET",
        //         });
        //         const pjson = await response.json();
        //         console.log("Pieces PJSON:", pjson);
        //         if (pjson.pieces) {
        //             setPieceResults(pjson.pieces);
        //         }
        //     }
        // };
        //
        // const fetchCollections = async () => {
        //     if (cookies['login_cookie']) {
        //         const response = await fetch(`http://localhost:65535/search/collections/${term}`, {
        //             method: "GET",
        //         });
        //         const pjson = await response.json();
        //         console.log("Collection PJSON:", pjson);
        //         if (pjson.collections) {
        //             setCollectionResults(pjson.collections);
        //         }
        //     }
        // };
        //
        // const fetchLocations = async () => {
        //     if (cookies['login_cookie']) {
        //         const response = await fetch(`http://localhost:65535/search/locations/${term}`, {
        //             method: "GET",
        //         });
        //         const pjson = await response.json();
        //         console.log("Location PJSON:", pjson);
        //         if (pjson.locations) {
        //             setLocationResults(pjson.locations);
        //         }
        //     }
        // };

        const fetchArtists = async () => {
            const name = searchParam.get("a-name") ? searchParam.get("a-name").split(" ").join("_") : "%00";

            let dob;
            if (isNaN(Date.parse(searchParam.get("a-dob")))) {
                dob = "%00";
            } else {
                dob = searchParam.get("a-dob").toString();
            }

            let dod;
            if (isNaN(Date.parse(searchParam.get("a-dod")))) {
                dod = "%00";
            } else {
                dod = searchParam.get("a-dod").toString();
            }

            const desc = searchParam.get("a-desc") ? searchParam.get("a-desc").split(" ").join("_") : "%00";
            console.log(name, dob, dod, desc);
            if (cookies['login_cookie']) {
                const response = await fetch(`http://localhost:65535/advanced-search/artists/${name}/${dob}/${dod}/${desc}`, {
                    method: "GET",
                });
                const pjson = await response.json();
                console.log("Artists PJSON:", pjson);
                if (pjson.artists) {
                    setArtistResults(pjson.artists);
                }
            }
        };

        // fetchProfiles();
        // fetchPieces();
        // fetchCollections();
        // fetchLocations();
        if (searchParam.has("a-name")) fetchArtists();
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
