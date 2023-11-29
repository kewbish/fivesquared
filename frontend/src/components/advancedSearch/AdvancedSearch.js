import {useState} from "react";
import ArtistSearch from "./ArtistSearch";
import ArtPieceSearch from "./ArtPieceSearch";
import CollectionSearch from "./CollectionSearch";
import LocationSearch from "./LocationSearch";

function AdvancedSearch() {
    const [state, setState] = useState(0);

    return (
        <div className="flex flex-col items-center">
        <form
            action="/advanced/search"
            className="flex flex-col justify-center p-10 content-center rounded-lg space-y-10"
        >
            <h1>Advanced Search</h1>
            <ArtPieceSearch />
            <hr/>
            <ArtistSearch />
            <hr/>
            <CollectionSearch />
            <hr/>
            <LocationSearch />
            <div>
            <input type="submit"
                   value="Search"
                   className="py-2 px-3 justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm disabled:bg-blue-300"
            />
            </div>
        </form>
        </div>
    )
}

export default AdvancedSearch;
