const LocationSearch = () => {
    return (
        <div
            className="space-y-5"
        >
            <h1>Location Search</h1>
            <div className="grid grid-cols-2 w-full gap-5">
                <div>
                    <label htmlFor="input-label" className="text-sm font-medium mb-2">Name</label>
                    <input type="text"
                           className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                           placeholder="Name"
                           name="l-name"
                    />
                </div>
                <div>
                    <label htmlFor="input-label" className="text-sm font-medium mb-2">Established</label>
                    <div className="grid grid-cols-2 w-full gap-5">
                        <input type="number"
                               className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                               placeholder="Earliest"
                               max={new Date().getFullYear().toFixed(0)}
                               name="l-earl"
                        />
                        <input type="number"
                           className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                           placeholder="Latest"
                           max={new Date().getFullYear().toFixed(0)}
                           name="l-late"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Address</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Line 1"
                       name="l-addr"
                />
                </div>
            <div className="grid grid-cols-2 w-full gap-5">
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">City</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="City"
                       name="l-city"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Region</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Region"
                       name="l-regn"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Country</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Country"
                       name="l-ctry"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Post Code</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Post Code"
                       name="l-post"
                />
                </div>
            </div>
        </div>
    )
}

export default LocationSearch;
