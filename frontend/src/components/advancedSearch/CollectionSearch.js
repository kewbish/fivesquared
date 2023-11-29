const CollectionSearch = () => {
    return (
        <div
            className="space-y-5"
        >
            <h1>Collection Search</h1>
            <div className="grid grid-cols-2 w-full gap-5">
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Title</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Title"
                       name="c-title"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Curator</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Curator"
                       name="c-cur"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Theme</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Theme"
                       name="c-theme"
                />
                </div>
                <div>
                <label htmlFor="input-label" className="text-sm font-medium mb-2">Location</label>
                <input type="text"
                       className="py-3 px-4 w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                       placeholder="Location"
                       name="c-loc"
                />
                </div>
            </div>
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Description</label>
            <input type="text"
                   className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                   placeholder="Description"
                   name="c-desc"
            />
            </div>
        </div>
    )
}

export default CollectionSearch;
