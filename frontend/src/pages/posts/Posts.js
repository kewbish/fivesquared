import {useEffect, useState} from "react";
import "./Posts.css";
import Post from "../../components/post/Post";
import CreatePost from "./CreatePost";

function Posts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch("http://localhost:65535/posts", {
                method: "GET",
            });
            const pjson = await response.json();
            setPosts(pjson.posts);
        };

        fetchPosts();
    }, []);

    return (
        <div className="App">
            <div className="flex justify-center py-10">
                <div className="w-6/12 flex flex-col gap-10">
                    <CreatePost/>
                    {posts.map((post) => (
                        <Post post={post} key={post["post_id"]}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Posts;
