const ArtPieceSearch = () => {
    return (
        <div
            className="space-y-5"
        >
            <h1>Art Piece Search</h1>
            <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Title</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Title"
                       name="ap-title"
                />
                </div>
            <div className="grid grid-cols-3 w-full gap-5">
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Artist</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Artist"
                       name="ap-artist"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Medium</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Medium"
                       name="ap-med"
                />
                </div>
                <div>
                    <label htmlFor="input-label" className="text-sm font-medium mb-2">Value</label>
                    <div className="grid grid-cols-2 w-full gap-5">
                        <input type="number"
                               className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                               min={0}
                               step={0.01}
                               placeholder="Lowest"
                               name="ap-lo"
                        />
                        <input type="number"
                               className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                               min={0}
                               step={0.01}
                               placeholder="Highest"
                               name="ap-hi"
                        />
                    </div>
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Collection</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Collection Title"
                       name="ap-col"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Curator</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Curator"
                       name="ap-cur"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Location</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Location"
                       name="ap-loc"
                />
                </div>
            </div>
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Description</label>
            <input type="text"
                   className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                   placeholder="Description"
                   name="ap-desc"
            />
            </div>
        </div>
    )
}

export default ArtPieceSearch;
