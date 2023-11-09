import {useEffect, useState} from "react";
import Comment from "./Comment";
import CreateComment from "./CreateComment";
import {useCookies} from "react-cookie";
import { useNavigate } from "react-router-dom";

function Post({post}) {
    const [likes, setLikes] = useState(post["num_likes"]);
    const [comments, setComments] = useState([]);
    const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
    const navigate = useNavigate();

    const likePost = async () => {
        const response = await fetch(
            `http://localhost:65535/posts/${post["post_id"]}/likes`,
            {
                method: "POST",
            }
        );
        const pjson = await response.json();
        if (pjson.success) {
            setLikes((likes) => likes + 1);
        }
    };

    const fetchComments = async () => {
        const response = await fetch("http://localhost:65535/posts/" + post["post_id"] + "/comments", {
            method: "GET",
        });
        const cjson = await response.json();
        setComments(cjson.success);
    };

    const tagClicked = () => {
        navigate("/" + post["username"]);
    }

    useEffect(() => {
        fetchComments();
    }, []);

    // const viewPost = async () => {
    //     const response = await fetch ("http://localhost:65535/posts/" + post["post_id"], {
    //         method: "GET",
    //     });
    //
    // }

    return (
        <div className="flex flex-col bg-white border shadow-sm rounded-xl text-left">
            {post["image_url"] && <>
                <img
                    className="w-full h-auto rounded-t-xl"
                    src={post["image_url"]}
                    alt={"Photo of piece ID " + post["piece_id"]}
                /></>}
            <div className="p-4 md:p-4">
                {post["text"] &&
                    (post["age_restricted"] === 0 ? (
                        <p className="my-1 text-gray-800 ">
                            {post["text"]} — @ art piece {post["piece_id"]}
                        </p>
                    ) : (
                        <p className="my-1 text-gray-800 ">Age restricted.</p>
                    ))}
                <div className="flex flex-row justify-between items-end">
                    <div>
                        <div>
                            <p className="text-gray-400 text-small text-left underline cursor-pointer" onClick={tagClicked}>
                                Posted by @{post["username"]}
                            </p>
                            <p className="text-gray-400 text-small">
                                {new Date(post["datetime"]).toGMTString()}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-amber-400 hover:bg-amber-200 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all text-sm "
                        >
                            ❝ ❞
                        </button>
                        &nbsp;&nbsp;
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-red-400 hover:bg-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all text-sm "
                            onClick={cookies.login_cookie ? likePost : null}
                        >
                            {likes} ❤
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <hr></hr>
            </div>
            <div>
                <CreateComment postId={post["post_id"]}/>
            </div>
            {comments.length > 0 && <>
                <div className="pb-4">
                    <hr></hr>
                </div>
                <div className="ml-6 flex flex-col justify-center">
                    {comments.map((comment) => (
                            <div>
                                <Comment comment={comment} key={comment["comment_id"]}/>
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
