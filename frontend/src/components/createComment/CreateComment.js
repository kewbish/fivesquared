import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

function CreateComment({ postId, onUpdate }) {
  const [text, setText] = useState("");
  const [ageRestricted, setAgeRestricted] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie', 'y_pos']);
  const navigate = useNavigate();

  const createComment = async () => {
    const response = await fetch(`http://localhost:65535/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        username: cookies.login_cookie,
        text,
        age_restricted: ageRestricted ? 1 : 0,
        post_id: postId,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const cjson = await response.json();
    setText("");
    onUpdate();
  };

  const goToLogin = () => {
    navigate("/login");
  }

  if (!cookies.login_cookie) {
    return (
        <div className="p-2 text-center">
          <h2 className="font-bold text-gray-800 cursor-pointer" onClick={goToLogin}>
            {/*Should add the ability to click this to log in*/}
            Log in to comment
          </h2>
        </div>
    )
  } else {
    return (
        <div className="flex flex-col">
          <div className="flex flex-col bg-white rounded-xl p-6 md:pr-4 text-left gap-4">
            <h3 className="text-lg font-bold text-gray-800">New comment</h3>
            <textarea
                className="px-4 block w-full border-gray-200 rounded-md shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                rows="2"
                placeholder="Text"
                value={text}
                onChange={(e) => setText(e.target.value)}
            ></textarea>
            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm text-gray-500">
                  <input
                      id="hs-small-switch-soft"
                      type="checkbox"
                      className="mr-2 peer relative w-11 h-6 p-px bg-gray-100 border border-gray-200 text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-100 checked:border-blue-200 focus:checked:border-blue-200 before:inline-block before:w-5 before:h-5 before:bg-white checked:before:bg-blue-600 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200"
                      checked={ageRestricted}
                      onChange={() => setAgeRestricted((ar) => !ar)}
                  />
                  Age restricted
                </label>
              </div>
              <button
                  type="button"
                  className="py-2 px-3 justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                  onClick={createComment}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
    );
  }
}

export default CreateComment;
