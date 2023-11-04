function Post({ post }) {
  return (
    <div className="flex flex-col bg-white border shadow-sm rounded-xl">
      <img
        className="w-full h-auto rounded-t-xl"
        src={post["image_url"]}
        alt={"Photo of piece ID " + post["piece_id"]}
      />
      <div className="p-4 md:p-5">
        {post["text"] &&
          (post["age_restricted"] === 0 ? (
            <p className="my-1 text-gray-800 ">
              {post["text"]} — @ art piece {post["piece_id"]}
            </p>
          ) : (
            <p className="my-1 text-gray-800 ">Age restricted.</p>
          ))}
        <div>
          <p className="text-gray-400 text-small text-left">
            Posted by @{post["username"]}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-400 text-small">
            {new Date(post["datetime"]).toGMTString()}
          </p>
          <button
            type="button"
            class="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-red-400 hover:text-white hover:bg-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all text-sm "
          >
            {post["num_likes"]} ❤️
          </button>
        </div>
      </div>
    </div>
  );
}

export default Post;
