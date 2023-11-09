import { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [pieceId, setPieceId] = useState(0);
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie', 'y_pos']);
  const fileUploadRef = useRef(null);
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
  };

  const fileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      return 0;
    }
    const fileReader = new FileReader();
    fileReader.onload = (fileLoadedEvent) => {
      const file = fileLoadedEvent.target.result;
      setImageUrl(file);
    };
    fileReader.readAsDataURL(files[0]);
  };

  const goToLogin = () => {
    navigate("/login");
  }

  if (!cookies.login_cookie) {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800 cursor-pointer" onClick={goToLogin}>
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
            <div>
              <label
                htmlFor="af-submit-app-upload-images"
                class="group p-4 sm:p-7 block cursor-pointer text-center border-2 border-dashed border-gray-200 rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              >
                <input
                  id="af-submit-app-upload-images"
                  name="af-submit-app-upload-images"
                  type="file"
                  class="sr-only"
                  onChange={fileUpload}
                  ref={fileUploadRef}
                />
                <svg
                  class="w-10 h-10 mx-auto text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"
                  />
                  <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                </svg>
                <span className="mt-2 block text-sm text-gray-800">
                  Browse your device or{" "}
                  <span className="group-hover:text-blue-700 text-blue-600">
                    drag 'n drop'
                  </span>
                </span>
              </label>
            </div>
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
                  onChange={(e) => setPieceId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  <input
                    id="hs-default-checkbox"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                    checked={ageRestricted}
                    onChange={() => setAgeRestricted((ar) => !ar)}
                  />
                  Age restricted
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
