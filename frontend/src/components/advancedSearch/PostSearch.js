const PostSearch = () => {
    return (
        <form
            action="/advanced-search"
            className="space-y-5"
        >
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Name</label>
            <input type="text"
                   className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                   placeholder="Name"
                   name="a-name"
            />
            </div>
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Born after</label>
            <input type="date"
                   className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                   name="a-dob"
            />
            </div>
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Died before</label>
            <input type="date"
                   className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                   name="a-dod"
            />
            </div>
            <div>
            <label htmlFor="input-label" className="block text-sm font-medium mb-2">Description</label>
                <textarea
                   className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                   name="a-desc"
                />
            </div>
            <div>
            <input type="submit"
                   value="Search"
                   className="py-2 px-3 justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm disabled:bg-blue-300"
            />
            </div>
        </form>
    )
}

export default PostSearch;
