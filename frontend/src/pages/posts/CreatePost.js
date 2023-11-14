import { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../components/ImageUpload";

function CreatePost({ onUpdate }) {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [pieceId, setPieceId] = useState(1);
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([
    "login_cookie",
    "y_pos",
  ]);
  const navigate = useNavigate();

  const createPost = async () => {
    const response = await fetch("http://localhost:65535/posts", {
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
    setText("");
    setImageUrl("");
    onUpdate();
  };

  const goToLogin = () => {
    navigate("/login");
  };

  if (!cookies.login_cookie) {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2
          className="font-bold text-gray-800 cursor-pointer"
          onClick={goToLogin}
        >
          {/*Should add the ability to click this to log in*/}
          Log in to post
        </h2>
      </div>
    );
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
          {imageUrl ? (
            <div className="relative">
              <button
                type="button"
                class="absolute top-4 right-4 py-1 px-2 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => setImageUrl("")}
              >
                X
              </button>
              <img
                src={imageUrl}
                className="block w-full border border-gray-200 rounded-md shadow-sm text-sm text-gray-800"
                alt="File upload preview"
              />
            </div>
          ) : (
            <ImageUpload setImageUrl={setImageUrl} />
          )}
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="flex rounded-md">
                <span className="pr-4 inline-flex items-center min-w-fit text-sm text-gray-500">
                  Piece ID
                </span>
                <input
                  type="number"
                  className="py-2 px-4 block w-20 border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  value={pieceId}
                  min={1}
                  onChange={(e) => setPieceId(e.target.value)}
                />
              </div>
              <div className="relative inline-block">
                <label className="text-sm text-gray-500">
                  <input
                    id="hs-small-switch-soft"
                    type="checkbox"
                    className="mr-2 peer relative w-11 h-6 p-px bg-gray-100 border border-gray-200 text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-100 checked:border-blue-200 focus:checked:border-blue-200 before:inline-block before:w-5 before:h-5 before:bg-white checked:before:bg-blue-600 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200"
                    checked={ageRestricted}
                    onChange={() => setAgeRestricted((ar) => !ar)}
                  />
                  Age Restricted
                </label>
              </div>
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
