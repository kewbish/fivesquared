import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import { makeToast } from "../../pages/nav/Nav";

function Comment({comment, onUpdate}) {
    const [cookies, setCookie, removeCookie] = useCookies(['login_cookie', 'y_pos']);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const getCommentLikes = async () => {
        setLoaded(false);
        const response = await fetch(
            `http://localhost:65535/posts/${comment["post_id"]}/comments/${comment["comment_id"]}/like`,
            {
                method: "GET"
            }
        );
        const cjson = await response.json();
        setLikes(cjson.success);
        setLoaded(true);
    };

    const likeComment = async () => {
        if (!cookies.login_cookie) return null;
        const response = await fetch(
            `http://localhost:65535/posts/${comment["post_id"]}/comments/${comment["comment_id"]}/like`, {
                method: "POST",
                body: JSON.stringify({
                    username: cookies.login_cookie,
                    post_id: comment["post_id"],
                    comment_id: comment["comment_id"]
                }),
                headers: { "Content-Type": "application/json" },
            });
        const cjson = await response.json();
        if (cjson.success) {
            setLoaded(false);
            await getCommentLikes();
            setLiked(true);
            setLoaded(true);
        }
    };

    const unlikeComment = async () => {
        if (!cookies.login_cookie) return null;
        const response = await fetch(
            `http://localhost:65535/posts/${comment["post_id"]}/comments/${comment["comment_id"]}/like`, {
                method: "DELETE",
                body: JSON.stringify({
                    username: cookies.login_cookie,
                    post_id: comment["post_id"],
                    comment_id: comment["comment_id"]
                }),
                headers: { "Content-Type": "application/json" },
            });
        const cjson = await response.json();
        if (cjson.success) {
            setLoaded(false);
            await getCommentLikes();
            setLiked(false);
            setLoaded(true);
        }
    };

    const isCommentLiked = async () => {
        if (!cookies['login_cookie']) return;

        setLoaded(false);
        const response = await fetch(
            `http://localhost:65535/posts/${comment["post_id"]}/comments/${comment["comment_id"]}/like/${cookies['login_cookie']}`,
            {
                method: "GET"
            });
        const cjson = await response.json();
        setLiked(cjson.success);
        setLoaded(true);
    }

    const deleteComment = async () => {
        if (!cookies['login_cookie']) return null;

        const response = await fetch(
            `http://localhost:65535/posts/${comment["post_id"]}/comments/${comment["comment_id"]}`,
            {
                method: "DELETE",
            });
        const cjson = await response.json();
        if (cjson.success) {
            makeToast('Comment deleted!');
        } else {
            makeToast("We couldn't delete your comment.", false);
        }
        onUpdate();
    }

    useEffect(() => {
        getCommentLikes();
        isCommentLiked();
    }, []);

    return (
        <div className="w-12/12 flex flex-col bg-white">
            <div className="pr-4 md:pr-4">
                <div className="flex flex-row items-start justify-between">
                    {comment["text"] &&
                    (comment["age_restricted"] === 0 ? (
                        <p className="my-1 text-gray-800 ">
                            {comment["text"]}
                        </p>
                    ) : (
                        <p className="my-1 text-gray-800 ">Age restricted.</p>
                    ))}
                    {(cookies.login_cookie === comment.username) &&
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex self-end gap-2 rounded-md font-semibold text-gray-400 transition-all"
                            onClick={deleteComment}
                        >
                            🗑
                        </button>
                    }
                </div>
                <div className="flex flex-row justify-between items-end">
                    <div>
                        <p className="text-gray-400 text-small text-left">
                            Commented by <a className="cursor-pointer underline" href={"/profile/" + comment["username"]}>@{comment["username"]}</a>
                        </p>
                        <p className="text-gray-400 text-small">
                            {new Date(comment["datetime"]).toGMTString()}
                        </p>
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className={liked ?
                                "py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md font-semibold text-red-400 transition-all":
                                "py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md font-semibold text-gray-400 transition-all"
                            }
                            onClick={cookies.login_cookie ? liked ? unlikeComment : likeComment : null}
                            disabled={!loaded}
                        >
                            {likes} {liked ? "❤️" : "🩶"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Comment;
