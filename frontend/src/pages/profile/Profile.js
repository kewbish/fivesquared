import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "../../components/post/Post";
import { Modal } from "antd";
import ProfileResultCard from '../../components/profileResultCard/ProfileResultCard';
import BadgeCard from '../../components/badgeCard/BadgeCard';
import ImageUpload from "../../components/ImageUpload";
import { useForm } from "react-hook-form";

const Profile = () => {
  const [cookies] = useCookies(["login_cookie"]);
  const [profileData, setProfileData] = useState(null);
  const [following, setFollowing] = useState(false);
  const { tag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowees, setShowFollowees] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (cookies['login_cookie']) {
        const response = await fetch(`http://localhost:65535/profile/${cookies['login_cookie']}/${tag}`, {
          method: "GET",
        });
        const pjson = await response.json();
        setProfileData(pjson.profile);
        if (pjson.profile) {
          setFollowing(pjson.profile.followingStatus);
          setImageUrl(pjson.profile.pfp_url);
        }
      }
    };

    fetchProfile();
  }, [following, showEdit]);

  const onSubmit = async (data) => {
    console.log({
      username: cookies['login_cookie'],
      password: data.password,
      bio: data.bio,
      dob: data.dob,
      img_url: imageUrl
        ? imageUrl
        : "https://placehold.co/400x400/grey/white?text=pfp",
    });

    const response = await fetch("http://localhost:65535/updateProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cookies['login_cookie'],
        password: data.password,
        bio: data.bio,
        dob: data.dob,
        img_url: imageUrl
          ? imageUrl
          : "https://placehold.co/400x400/grey/white?text=pfp",
      }),
    });
    const result = await response.json();
    if (result.success) {
      console.log("RESULT: ", result);
      toggleEdit();
    } else {
      console.log("RESULT: ", result);
    }
  };

  const getPosts = async () => {
    const response = await fetch(`http://localhost:65535/posts/${tag}`, {
      method: "GET",
    });
    const pjson = await response.json();
    setPosts(pjson.posts);
  };

  useEffect(() => {
    getPosts();
  }, []);

  const followToggle = async () => {
    if (following) {
      const response = await fetch(`http://localhost:65535/unfollow/${cookies['login_cookie']}/${tag}`, {
        method: "DELETE",
      });
      if (response) {
        setFollowing(false);
      }
    } else {
      const response = await fetch(`http://localhost:65535/follow/${cookies['login_cookie']}/${tag}`, {
        method: "POST",
      });
      if (response) {
        setFollowing(true);
      }
    }
  }

  const goToLogin = () => {
    navigate("/login");
  }

  const toggleFollowers = () => {
    setShowFollowers(!showFollowers);
  };

  const toggleFollowees = () => {
    setShowFollowees(!showFollowees);
  };

  const toggleBadges = () => {
    setShowBadges(!showBadges);
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  if (!cookies.login_cookie) {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800 cursor-pointer" onClick={goToLogin}>
          Log in to view user profiles.
        </h2>
      </div>
    );
  } else if (profileData) {
    // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
    // a component library example: https://freefrontend.com/tailwind-profiles/ & https://tailwindui.com/components/application-ui/forms/sign-in-forms. The code was not auto-generated, and we made significant
    // changes to the template to style it with our project's specific goals.
    return (
      <>
        <div class="p-16">
          <div class="p-8 bg-white border shadow-sm rounded-xl mt-24">
            <div class="grid grid-cols-1 md:grid-cols-3">
              <div class="grid grid-cols-3 text-center order-last md:order-first mt-20 md:mt-0">
                <div class="cursor-pointer hover:bg-blue-500 rounded hover:text-white" onClick={toggleFollowers}>
                  <p class="font-bold text-gray-700 text-xl">{profileData.followers.length}</p>
                  <p class="text-gray-400">Followers</p>
                </div>
                <div class="cursor-pointer hover:bg-blue-500 rounded hover:text-white" onClick={toggleFollowees}>
                  <p class="font-bold text-gray-700 text-xl">{profileData.followees.length}</p>
                  <p class="text-gray-400">Following</p>
                </div>
                <div class="cursor-pointer hover:bg-blue-500 rounded hover:text-white" onClick={toggleBadges}>
                  <p class="font-bold text-gray-700 text-xl">{profileData.badges.length}</p>
                  <p class="text-gray-400">Badges</p>
                </div>
              </div>
              <div class="relative">
                <div
                  class="w-48 h-48 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 text-indigo-500 bg-cover"
                  style={{ backgroundImage: `url(${profileData.pfp_url})` }}
                ></div>
              </div>
              <div class="space-x-8 flex justify-between mt-32 md:mt-0 md:justify-center">
                {tag === cookies['login_cookie'] ? <button onClick={toggleEdit}
                  class="text-white py-2 px-4 uppercase rounded bg-gray-700 hover:bg-gray-800 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
                >
                  Edit Profile
                </button> : <button onClick={followToggle}
                  class="text-white py-2 px-4 uppercase rounded bg-blue-400 hover:bg-blue-500 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
                >
                  {following ? "Unfollow" : "Follow"}
                </button>}

              </div>
            </div>

            <div class="mt-20 text-center pb-12">
              <h1 class="text-4xl font-medium text-gray-700">{tag}, <span class="font-light text-gray-500">{profileData.age}</span></h1>
              <p class="font-light text-gray-600 mt-3">{profileData.bio}</p>

              {/* <p class="mt-8 text-gray-500">(We could put recent posts here once we make up an endpoint for specific user posts. Didn't want to touch this right now while you guys are working on other posts functionality.)</p> */}
            </div>
            <div className="flex justify-center">
              <div class="flex flex-col gap-5 w-3/5">
                <h2 class="font-bold text-center text-gray-800">Recent Posts</h2>
                {posts.map((post) => (
                  <Post post={post} onUpdate={getPosts} key={post["post_id"]} />
                ))}
                {(posts.length == 0) ? <div className="p-2 text-center">
                  <h2 className="text-gray-800">
                    No posts here yet! Exciting things are yet to come!
                  </h2>
                </div> : <></>}
              </div>
            </div>
          </div>
        </div>
        <Modal title="Followers" open={showFollowers} onCancel={toggleFollowers} footer={null} width={"60%"}>
          {(profileData.followers.length == 0) ? <div className="p-2 text-center">
            <h2 className="text-gray-800">
              No followers yet :(
            </h2>
          </div> : <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {profileData.followers.map((profile) => (
              <ProfileResultCard profileData={profile} />
            ))}
          </div>}
        </Modal>
        <Modal title="Following" open={showFollowees} onCancel={toggleFollowees} footer={null} width={"60%"}>
          {(profileData.followees.length == 0) ? <div className="p-2 text-center">
            <h2 className="text-gray-800">
              Not following anyone yet :(
            </h2>
          </div> : <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {profileData.followees.map((profile) => (
              <ProfileResultCard profileData={profile} />
            ))}
          </div>}
        </Modal>
        <Modal title="Badges" open={showBadges} onCancel={toggleBadges} footer={null} width={"60%"}>
          {(profileData.badges.length == 0) ? <div className="p-2 text-center">
            <h2 className="text-gray-800">
              No badges yet :(
            </h2>
          </div> : <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {profileData.badges.map((badge) => (
              <BadgeCard badgeData={badge} />
            ))}
          </div>}
        </Modal>
        <Modal title="Edit Profile (username cannot be changed)" open={showEdit} onCancel={toggleEdit} footer={null} width={"35%"}>
          <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-2 ">
              <div className="sm:mx-auto w-full">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Choose a new password
                      </label>
                    </div>
                    <div className="mt-2">
                      <input
                        defaultValue={profileData.password}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        {...register("password", { required: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Change your birthday
                    </label>
                    <div className="mt-2">
                      <input
                      defaultValue={profileData.dob}
                        id="dob"
                        name="dob"
                        type="date"
                        autoComplete="date"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        {...register("dob", { required: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Update your bio
                    </label>
                    <div className="mt-2">
                      <textarea
                        defaultValue={profileData.bio}
                        maxLength={120}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        {...register("bio", { required: true })}
                      />
                    </div>
                  </div>

                  {imageUrl ? (
                    <div>
                      <label
                        htmlFor="image"
                        className="mb-2 block text-sm font-medium leading-6 text-gray-900"
                      >
                        Choose a new profile picture
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          class="absolute top-4 right-4 py-1 px-2 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => setImageUrl("")}
                        >
                          X
                        </button>
                        <img
                          src={imageUrl}
                          className="block w-full border border-gray-200 rounded-md shadow-sm text-sm text-gray-800"
                          alt="File upload preview"
                        />
                      </div>
                    </div>

                  ) : (
                    <div>
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Choose a new profile picture
                      </label>
                      <ImageUpload setImageUrl={setImageUrl} />
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md bg-blue-500 hover:bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        </Modal>
      </>
    );
  } else {
    return (
      <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
        <h2 className="font-bold text-gray-800">
          Loading profile data...
        </h2>
      </div>
    );
  }
};

export default Profile;
