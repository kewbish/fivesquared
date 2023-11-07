import { useState } from "react";
import { useCookies } from "react-cookie";

function CreatePost() {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [pieceId, setPieceId] = useState(0);
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);

  const createPost = async () => {
    const response = await fetch("http://localhost:65535/posts/create", {
      method: "POST",
      body: JSON.stringify({
        username: cookies.login_cookie,
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

  if (!cookies.login_cookie) {
    return (
        <div className="p-2 text-center">
          <h2 className="font-bold text-gray-800">
            {/*Should add the ability to click this to log in*/}
            Log in to post
          </h2>
        </div>
    )
  } else {
    return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col bg-white border shadow-sm rounded-xl p-6 text-left gap-4">
            <h3 className="text-lg font-bold text-gray-800">New post</h3>
            <textarea
                className="py-3 px-4 block w-full border-gray-200 rounded-md shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
                placeholder="Text"
                value={text}
                onChange={(e) => setText(e.target.value)}
            ></textarea>
            <div>
              <div className="flex rounded-md">
              <span className="pr-4 inline-flex items-center min-w-fit text-sm text-gray-500">
                Image URL
              </span>
                <input
                    type="url"
                    className="py-3 px-4 block w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex rounded-md">
              <span className="px-4 inline-flex items-center min-w-fit text-sm text-gray-500">
                Piece ID
              </span>
                  <input
                      type="number"
                      className="py-3 px-4 block w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      value={pieceId}
                      onChange={(e) => setPieceId(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  <input id="hs-default-checkbox"
                         type="checkbox"
                         className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                         checked={ageRestricted}
                         onChange={() => setAgeRestricted((ar) => !ar)}
                  />
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
        </div>
    );
  }
}

export default CreatePost;
