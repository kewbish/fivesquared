import { useEffect, useState } from "react";
import Post from "../../components/post/Post";
import { useCookies } from "react-cookie";

const Collection = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["param_cookie"]);
  const [collectionData, setCollectionData] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchCollection = async () => {
    console.log(cookies["param_cookie"]);
    const response = await fetch(`http://localhost:65535/collection/${cookies["param_cookie"]}`, {
      method: "GET",
    });
    const pjson = await response.json();
    console.log("Collection Page PJSON", pjson);
    setCollectionData(pjson.collection);
  };

  const getPosts = async () => {
    const response = await fetch(`http://localhost:65535/posts/collection/${cookies["param_cookie"]}`, {
      method: "GET",
    });
    const pjson = await response.json();
    setPosts(pjson.posts);
  };

  useEffect(() => {
    fetchCollection();
    getPosts();
  }, []);


  if (collectionData) {
    // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
    // a component library example: https://freefrontend.com/tailwind-profiles/. The code was not auto-generated, and we made significant
    // changes to the template to style it with our project's specific goals.
    return (
      <>
        <div class="p-16">
          <div class="p-8 bg-white border shadow-sm rounded-xl mt-24">
            <div class="grid grid-cols-1 md:grid-cols-3">
              <div class="grid grid-cols-3 text-center order-last md:order-first mt-20 md:mt-0">
                <div>
                  <p class="font-bold text-gray-700 text-xl">{posts.length}</p>
                  <p class="text-gray-400">Related Posts</p>
                </div>
              </div>
              <div class="relative">
                <div class="w-48 h-48 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500">
                  <img src="https://cdn0.iconfinder.com/data/icons/job-seeker/256/folder_job_seeker_employee_unemployee_work-512.png" style={{ borderRadius: "50%" }} viewBox="0 0 20 20" />
                </div>
              </div>
              <div class="space-x-8 flex justify-between mt-32 md:mt-0 md:justify-center">
              </div>
            </div>

            <div class="mt-20 text-center pb-12">
              <h1 class="text-4xl font-medium text-gray-700">{collectionData.title}, <span class="font-light text-gray-500">{collectionData.curator}</span></h1>
              <p class="font-light text-gray-600 mt-3">{collectionData.description}</p>
            </div>
            <div className="flex justify-center">
              <div class="flex flex-col gap-5 w-3/5">
                <h2 class="font-bold text-center text-gray-800">Recent Posts</h2>
                {posts.map((post) => (
                  <Post post={post} onUpdate={getPosts} key={post["post_id"]} />
                ))}
                {(posts.length === 0) ? <div className="p-2 text-center">
                  <h2 className="text-gray-800">
                    No posts here yet! Exciting things are yet to come!
                  </h2>
                </div> : <></>}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800">
          Loading collection data...
        </h2>
      </div>
    );
  }
};

export default Collection;
