const ArtistSearch = () => {
    return (
        <div
            className="space-y-5"
        >
            <h1>Artist Search</h1>
            <div className="grid grid-cols-3 space-x-5">
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Name</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Name"
                       name="a-name"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Born after</label>
                <input type="date"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       name="a-dob"
                       max={new Date().toISOString().split("T")[0]}
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Died before</label>
                <input type="date"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       name="a-dod"
                       max={new Date().toISOString().split("T")[0]}
                />
                </div>
            </div>
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Description</label>
                <input
                    type="text"
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                    placeholder="Description"
                    name="a-desc"
                />
            </div>
        </div>
    )
}

export default ArtistSearch;
