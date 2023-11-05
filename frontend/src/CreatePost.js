import { useState } from "react";

function CreatePost() {
  const [username, setUsername] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [pieceId, setPieceId] = useState(0);
  const [ageRestricted, setAgeRestricted] = useState(false);

  const createPost = async () => {
    const response = await fetch("http://localhost:65535/posts/", {
      method: "POST",
      body: JSON.stringify({
        username,
        image_url: imageUrl,
        text,
        age_restricted: ageRestricted ? 1 : 0,
        piece_id: Number.parseInt(pieceId),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const pjson = await response.json();
    console.log(pjson);
  };

  return (
    <div className="flex flex-col bg-white border shadow-sm rounded-xl p-6 text-left gap-4">
      <h3 className="text-lg font-bold text-gray-800">New post</h3>
      <div>
        <div className="flex rounded-md shadow-sm">
          <span className="px-4 inline-flex items-center min-w-fit rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
            Username
          </span>
          <input
            type="text"
            className="py-2 px-3 pr-11 block w-full border-gray-200 rounded-r-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>
      <div>
        <div className="flex rounded-md shadow-sm">
          <span className="px-4 inline-flex items-center min-w-fit rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
            Image URL
          </span>
          <input
            type="url"
            className="py-2 px-3 pr-11 block w-full border-gray-200 rounded-r-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
      </div>
      <textarea
        className="py-3 px-4 block w-full border-gray-200 rounded-md shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
        rows="3"
        placeholder="Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <div>
        <div className="flex rounded-md shadow-sm">
          <span className="px-4 inline-flex items-center min-w-fit rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
            Piece ID
          </span>
          <input
            type="number"
            className="py-3 px-4 block w-full border-gray-200 rounded-r-md text-sm focus:border-blue-500 focus:ring-blue-500"
            value={pieceId}
            onChange={(e) => setPieceId(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between content-top">
        <div>
          <input
            type="checkbox"
            className="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 pointer-events-none focus:ring-blue-500"
            id="hs-default-checkbox"
            checked={ageRestricted}
            onChange={() => setAgeRestricted((ar) => !ar)}
          />
          <label
            htmlFor="hs-default-checkbox"
            className="text-sm text-gray-500 ml-3"
          >
            Age restricted
          </label>
        </div>
        <button
          type="button"
          className="py-2 px-3 justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
          onClick={createPost}
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
