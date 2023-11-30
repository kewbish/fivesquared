import { useEffect, useState } from "react";
import Post from "../../components/post/Post";
import { useParams } from 'react-router-dom';

const Gallery = () => {
  const { name } = useParams();
  const [galleryData, setGalleryData] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchGallery = async () => {
    const response = await fetch(`http://localhost:65535/gallery/${name}`, {
      method: "GET",
    });
    const pjson = await response.json();
    console.log("Gallery Page PJSON", pjson);
    setGalleryData(pjson.gallery);
  };

  const getPosts = async () => {
    const response = await fetch(`http://localhost:65535/posts/location/${name}`, {
      method: "GET",
    });
    const pjson = await response.json();
    setPosts(pjson.posts);
  };

  useEffect(() => {
    fetchGallery();
    getPosts();
  }, []);


  if (galleryData) {
    // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
    // a component library example: https://freefrontend.com/tailwind-profiles/. The code was not auto-generated, and we made significant
    // changes to the template to style it with our project's specific goals.
    return (
      <>
        <div className="p-16">
          <div className="p-8 bg-white border shadow-sm rounded-xl mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="grid grid-cols-2 text-center order-last md:order-first mt-20 md:mt-0">
                <div>
                  <p className="font-bold text-gray-700 text-xl">{galleryData.yr_est}</p>
                  <p className="text-gray-400">Established</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-xl">{posts.length}</p>
                  <p className="text-gray-400">Related Posts</p>
                </div>
              </div>
              <div className="relative">
                <div className="w-48 h-48 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500">
                  <img src="https://cdn2.iconfinder.com/data/icons/public-services-flaticon/64/MUSEUM-roman-temple-buildings-monuments-greek-1024.png" style={{ borderRadius: "50%" }} viewBox="0 0 20 20" />
                </div>
              </div>
              <div className="grid grid-cols-2 text-center mt-20 md:mt-0">
                <div>
                  <p className="font-bold text-gray-700 text-xl">{galleryData.num_pieces}</p>
                  <p className="text-gray-400">No. Pieces</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-xl">{galleryData.curator}</p>
                  <p className="text-gray-400">Curator</p>
                </div>
              </div>
              <div className="space-x-8 flex justify-between mt-32 md:mt-0 md:justify-center">
              </div>
            </div>

            <div className="mt-20 text-center pb-12">
              <h1 className="text-4xl font-medium text-gray-700">{galleryData.name}</h1>
              <p className="text-2xl font-light text-gray-500 mt-3">{galleryData.st_address}<br/>{galleryData.city}, {galleryData.region} {galleryData.postcode}<br/> {galleryData.country}</p>
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
          Loading gallery data...
        </h2>
      </div>
    );
  }
};

export default Gallery;
