import { useEffect, useState } from "react";
import "./Posts.css";
import Post from "../../components/post/Post";
import CreatePost from "../../components/createPost/CreatePost";
import { useCookies } from "react-cookie";

function Posts() {
    const [posts, setPosts] = useState([]);
    const [toggleStatus, setToggleStatus] = useState(false);
    const [cookies] = useCookies(['login_cookie']);

    const getPosts = async () => {
        if (toggleStatus || !cookies['login_cookie']) {
            const response = await fetch("http://localhost:65535/posts", {
                method: "GET",
            });
            const pjson = await response.json();
            setPosts(pjson.posts);
        } else {
            const response = await fetch(`http://localhost:65535/posts/following/${cookies['login_cookie']}`, {
                method: "GET",
            });
            const pjson = await response.json();
            setPosts(pjson.posts);
        }
    };

    useEffect(() => {
        getPosts();
    }, [toggleStatus]);

    const toggleFeed = () => {
        setToggleStatus(!toggleStatus);
    };

    // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component (the all posts/following toggle) around
    // a component library example: https://mambaui.com/components/toggle . The code was not auto-generated, and we made significant
    // changes to the template to style it with our project's specific goals.

    return (
        <div className="App">
            <div className="flex justify-center py-10">
                <div className="w-6/12 flex flex-col gap-5">
                    <CreatePost onUpdate={getPosts} />
                    {!!cookies.login_cookie ? <div className="relative inline-block">
                        <label form="Toggle3" className="inline-flex items-center p-2 rounded-md cursor-pointer">
                            <input id="Toggle3" type="checkbox" className="hidden peer" value={toggleStatus} defaultChecked={false} onChange={(e) => toggleFeed(e)}/>
                            <span className="px-4 py-2 rounded-l-md bg-blue-500 text-white peer-checked:bg-gray-200 peer-checked:text-gray-800">People I Follow</span>
                            <span className="px-4 py-2 rounded-r-md bg-gray-200 peer-checked:bg-blue-500 peer-checked:text-white">All Posts</span>
                        </label>
                    </div> : <></>}
                    {posts.map((post) => (
                        <Post post={post} onUpdate={getPosts} key={post["post_id"]} />
                    ))}
                    {(posts.length === 0) ? <div className="p-2 text-center">
                        <h2 className="font-bold text-gray-800">
                            {/*Should add the ability to click this to log in*/}
                            Nothing to see here! Follow some people to get started!
                        </h2>
                    </div> : <></>}
                </div>
            </div>
        </div>
    );
}

export default Posts;
