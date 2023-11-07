import {useState} from "react";
import {useCookies} from "react-cookie";

function Comment({comment}) {
    const [likes, setLikes] = useState(comment["num_likes"]);
    const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);

    const likeComment = async () => {
        const response = await fetch(
            `http://localhost:65535/posts/${comment["post_id"]}/comments/${comment["comment_id"]}/likes`,
            {
                method: "POST",
            }
        );
        const cjson = await response.json();
        if (cjson.success) {
            setLikes((likes) => likes + 1);
        }
    };

    return (
        <div className="w-12/12 flex flex-col bg-white">
            <div className="pr-4 md:pr-4">
                {comment["text"] &&
                    (comment["age_restricted"] === 0 ? (
                        <p className="my-1 text-gray-800 ">
                            {comment["text"]}
                        </p>
                    ) : (
                        <p className="my-1 text-gray-800 ">Age restricted.</p>
                    ))}
                <div className="flex flex-row justify-between items-end">
                    <div>
                        <p className="text-gray-400 text-small text-left">
                            Commented by @{comment["username"]}
                        </p>
                        <p className="text-gray-400 text-small">
                            {new Date(comment["datetime"]).toGMTString()}
                        </p>
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-red-400 hover:bg-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all text-sm "
                            onClick={cookies.login_cookie ? likeComment : null}
                        >
                            {likes} ❤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Comment;
