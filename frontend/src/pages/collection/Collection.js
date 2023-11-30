import { useEffect, useState } from "react";
import Post from "../../components/post/Post";
import { useParams } from 'react-router-dom';

const Collection = () => {
  const { title, curator } = useParams();
  const [collectionData, setCollectionData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [type, setType] = useState("");

  const getType = async (data) => {
    const mres = await fetch(`http://localhost:65535/museum/${data.location_name}`, {
      method: "GET",
    });
    const museum = await mres.json();

    const gres = await fetch(`http://localhost:65535/gallery/${data.location_name}`, {
      method: "GET",
    });
    const gallery = await gres.json();

    const pres = await fetch(`http://localhost:65535/private-collection/${data.location_name}`, {
      method: "GET",
    });
    const privateCollection = await pres.json();

    return !museum ? !gallery ? !privateCollection ? "undef" : "Private Collection" : "Gallery" : "Museum";
  }

  const fetchCollection = async () => {
    const response = await fetch(`http://localhost:65535/collection/${title}&${curator}`, {
      method: "GET",
    });
    const pjson = await response.json();
    console.log("Collection Page PJSON", pjson);
    setCollectionData(pjson.collection);
    setType(await getType(pjson.collection));
  };

  const getPosts = async () => {
    const response = await fetch(`http://localhost:65535/posts/collection/${title}&${curator}`, {
      method: "GET",
    });
    const pjson = await response.json();
    setPosts(pjson.posts);
  };

  useEffect(() => {
    fetchCollection().then(() => getPosts());
    // getPosts();
  }, []);


  if (collectionData) {
    // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
    // a component library example: https://freefrontend.com/tailwind-profiles/. The code was not auto-generated, and we made significant
    // changes to the template to style it with our project's specific goals.
    return (
      <>
        <div className="p-16">
          <div className="p-8 bg-white border shadow-sm rounded-xl mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="text-center">
                <p className="font-bold text-gray-700 text-xl">{posts.length}</p>
                <p className="text-gray-400">Related Posts</p>
              </div>
              <div className="relative">
                <div className="w-48 h-48 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500">
                  <img src="https://cdn0.iconfinder.com/data/icons/job-seeker/256/folder_job_seeker_employee_unemployee_work-512.png" style={{ borderRadius: "50%" }}
                  alt={"placeholder icon for collection"} viewBox="0 0 20 20" />
                </div>
              </div>
              <div className="text-center">
                <a className="font-bold text-gray-700 text-xl" href={`/${type.toLowerCase().split(" ").join("-")}/${collectionData.location_name}`}>{collectionData.location_name}</a>
                <p className="text-gray-400">{type}</p>
              </div>
            </div>

            <div className="mt-20 text-center pb-12">
              <h1 className="text-4xl font-medium text-gray-700">{collectionData.title}<span className="font-light text-gray-500"> by {collectionData.curator}</span></h1>
              <p className="font-light text-gray-600 mt-3">{collectionData.description}</p>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col gap-5 w-3/5">
                <h2 className="font-bold text-center text-gray-800">Recent Posts</h2>
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
