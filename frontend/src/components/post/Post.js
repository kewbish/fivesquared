import {useEffect, useState} from "react";
import Comment from "../Comment";

function Post({post}) {
    const [likes, setLikes] = useState(post["num_likes"]);
    const [comments, setComments] = useState([]);

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

    useEffect(() => {
        fetchComments();
    }, []);

    const makeComment = async () => {
      const response = await fetch("http://localhost:65535/" + post["post_id"] + "/comments", {
          method: "POST",
      });
      
    }

    return (
        <div className="flex flex-col bg-white border shadow-sm rounded-xl text-left">
            <img
                className="w-full h-auto rounded-t-xl"
                src={post["image_url"]}
                alt={"Photo of piece ID " + post["piece_id"]}
            />
            <div className="p-4 md:p-4">
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
                    <div>
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-amber-400 hover:bg-amber-200 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all text-sm "
                        >
                            ❝❞
                        </button>
                        &nbsp;&nbsp;
                        <button
                            type="button"
                            className="py-[.344rem] px-2 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-red-400 hover:bg-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all text-sm "
                            onClick={likePost}
                        >
                            {likes} ❤
                        </button>
                    </div>
                </div>
            </div>
            {comments.length > 0 && <>
                <div className="pb-4 pt-2">
                    <hr></hr>
                </div>
                <div className="ml-10 flex flex-col justify-center mb-4">
                    {comments.map((comment) => (
                            <Comment comment={comment} key={comment["comment_id"]}/>
                        )
                    )}
                </div>
            </>}
        </div>
    );
}

export default Post;
