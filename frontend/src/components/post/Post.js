import { useEffect, useState } from "react";
import Comment from "../comment/Comment";
import CreateComment from "../createComment/CreateComment";
import { useCookies } from "react-cookie";
import { makeToast } from "../../pages/nav/Nav";

function Post({ post, onUpdate }) {
    const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const getComments = async () => {
        const response = await fetch("http://localhost:65535/posts/" + post["post_id"] + "/comments", {
            method: "GET",
        });
        const pjson = await response.json();
        setComments(pjson.success);
    };

    const getPostLikes = async () => {
        setLoaded(false);
        const response = await fetch(
            `http://localhost:65535/posts/${post["post_id"]}/like`,
            {
                method: "GET"
            }
        );
        const pjson = await response.json();
        setLikes(pjson.success);
        setLoaded(true);
    };

    const likePost = async () => {
        if (!cookies.login_cookie) return null;
        console.log("liked!");
        const response = await fetch(
            `http://localhost:65535/posts/${post["post_id"]}/like`, {
            method: "POST",
            body: JSON.stringify({
                username: cookies.login_cookie,
                post_id: post["post_id"]
            }),
            headers: { "Content-Type": "application/json" },
        });
        const pjson = await response.json();
        if (pjson.success) {
            setLoaded(false);
            await getPostLikes();
            setLiked(true);
            setLoaded(true);
        }
    };

    const unlikePost = async () => {
        if (!cookies.login_cookie) return null;
        console.log("unliked!");
        const response = await fetch(
            `http://localhost:65535/posts/${post["post_id"]}/like`, {
            method: "DELETE",
            body: JSON.stringify({
                username: cookies.login_cookie,
                post_id: post["post_id"]
            }),
            headers: { "Content-Type": "application/json" },
        });
        const pjson = await response.json();
        if (pjson.success) {
            setLoaded(false);
            await getPostLikes();
            setLiked(false);
            setLoaded(true);
        }
    };

    const isPostLiked = async () => {
        if (!cookies['login_cookie']) return;

        setLoaded(false);
        const response = await fetch(
            `http://localhost:65535/posts/${post["post_id"]}/like/${cookies['login_cookie']}`,
            {
                method: "GET"
            });
        const pjson = await response.json();
        setLiked(pjson.success);
        setLoaded(true);
    }

    const deletePost = async () => {
        console.log('DELETE POST LOGIC');
        if (!cookies['login_cookie']) return null;

        const response = await fetch(
            `http://localhost:65535/posts/${post["post_id"]}`,
            {
                method: "DELETE",
            });
        let djson = await response.json();
        console.log('djson', djson);
        if (djson.success) {
            makeToast('Post deleted!');
        } else {
            makeToast("We couldn't delete that one.", false);
        }

        onUpdate();
    }

    useEffect(() => {
        getPostLikes();
        isPostLiked();
        getComments();
    }, []);

    return (
        <div className="flex flex-col bg-white border shadow-sm rounded-xl text-left">
            {post["image_url"] && <>
                <img
                    className="w-full h-auto rounded-t-xl"
                    src={post["image_url"]}
                    alt={"Photo of piece ID " + post["piece_title"]}
                /></>}
            <div className="p-4 md:p-4">
                <div className="flex flex-row items-start justify-between">
                    {post["text"] &&
                        (post["age_restricted"] === 0 ? (
                            <div>
                                <p className="my-1 text-gray-800 self-start">{post["text"]}</p>
                                <p className="text-gray-400">About <a className="cursor-pointer underline" href={"/piece/" + post["piece_id"]}>{post["piece_title"]}</a></p>
                            </div>
                        ) : (
                            <p className="my-1 text-gray-800 self-start">Age restricted.</p>
                        ))}
                    {(cookies.login_cookie === post.username) &&
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex self-end gap-2 rounded-md font-semibold text-gray-400 transition-all"
                            onClick={deletePost}
                        >
                            🗑
                        </button>
                    }
                </div>
                <div className="flex flex-row justify-between items-end">
                    <div>
                        <div>
                            <p className="text-gray-400 text-small text-left">
                                Posted by <a className="cursor-pointer underline" href={"/profile/" + post["username"]}>@{post["username"]}</a>
                            </p>
                            <p className="text-gray-400 text-small">
                                {new Date(post["datetime"]).toGMTString()}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md font-semibold text-gray-400 transition-all"
                        >
                            {comments.length} 💬
                        </button>
                        &nbsp;&nbsp;
                        <button
                            type="button"
                            className={liked ?
                                "py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md font-semibold text-red-400 transition-all" :
                                "py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md font-semibold text-gray-400 transition-all"
                            }
                            onClick={cookies.login_cookie ? (liked ? unlikePost : likePost) : null}
                            disabled={!loaded}
                        >
                            {likes} {liked ? "❤️" : "🩶"}
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <hr></hr>
            </div>
            <div>
                <CreateComment postId={post["post_id"]} onUpdate={getComments} />
            </div>
            {comments.length > 0 && <>
                <div className="pb-4">
                    <hr></hr>
                </div>
                <div className="ml-6 flex flex-col justify-center">
                    {comments.map((comment) => (
                        <div>
                            <Comment comment={comment} onUpdate={getComments} key={comment["comment_id"]} />
                            &nbsp;
                        </div>
                    )
                    )}
                </div>
            </>}
        </div>
    );
}

export default Post;
