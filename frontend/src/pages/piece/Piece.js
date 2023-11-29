import { useEffect, useState } from "react";
import Post from "../../components/post/Post";
import { useParams } from 'react-router-dom';

function Piece()  {
  const { term } = useParams();
  const [pieceData, setPieceData] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPiece = async () => {
      const response = await fetch(`http://localhost:65535/piece/${term}`, {
        method: "GET",
      });
      const pjson = await response.json();
      console.log("Piece Page PJSON", pjson);
      setPieceData(pjson.piece);
    };

    fetchPiece();
  }, []);

  const getPosts = async () => {
    const response = await fetch(`http://localhost:65535/posts/piece/${term}`, {
      method: "GET",
    });
    const pjson = await response.json();
    setPosts(pjson.posts);
  };

  useEffect(() => {
    getPosts();
  }, []);


  if (pieceData) {
    // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
    // a component library example: https://freefrontend.com/tailwind-profiles/. The code was not auto-generated, and we made significant
    // changes to the template to style it with our project's specific goals.
    return (
      <>
        <div className="p-16">
          <div className="p-8 bg-white border shadow-sm rounded-xl mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="grid grid-cols-3 text-center order-last md:order-first mt-20 md:mt-0">
                <div>
                  <p className="font-bold text-gray-700 text-xl">{"$" + pieceData.value}</p>
                  <p className="text-gray-400">Value</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-xl">{pieceData.year}</p>
                  <p className="text-gray-400">Year</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-xl">{posts.length}</p>
                  <p className="text-gray-400">Related Posts</p>
                </div>
              </div>

              <div className="relative">
                <div className="w-48 h-48 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500">
                  <img src="https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/art-1024.png" style={{ borderRadius: "50%" }} viewBox="0 0 20 20" />
                </div>
              </div>


              <div className="grid grid-cols-2 text-center order-last mt-20 md:mt-0">
                <div className="text-center">
                  <p className="font-semibold text-gray-700 text-xl">{pieceData.medium}</p>
                  <p className="text-gray-400">Medium</p>
                </div>
                <div className="text-center">
                  <a className="font-semibold text-gray-700 text-xl" href={`/collection/${pieceData.collection}/${pieceData.curator}`}>{pieceData.collection} by {pieceData.curator}</a>
                  <p className="text-gray-400">Collection</p>
                </div>
              </div>

            </div>

            <div className="mt-20 text-center pb-12">
              <h1 className="text-4xl font-medium text-gray-700">{pieceData.title}, <a className="font-light text-gray-500" href={`/artist/${pieceData.artist_id}`}>{pieceData.artist_name}</a></h1>
              <h2 className="text-3xl font-medium text-gray-700">{pieceData.collection} <a className="font-light text-gray-500" href={`/collection/${pieceData.collection}/${pieceData.curator}`}>by {pieceData.curator}</a></h2>
              <p className="font-light text-gray-600 mt-3">{pieceData.description}</p>
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
          Loading piece data...
        </h2>
      </div>
    );
  }
}

export default Piece;
