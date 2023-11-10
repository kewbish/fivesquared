import { useParams } from 'react-router-dom'
import { useCookies } from "react-cookie";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [cookies, setCookie, removeCookie] = useCookies(["login_cookie"]);
    const [profileData, setProfileData] = useState(null);
    const [following, setFollowing] = useState(false);
    const { tag } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            if (cookies['login_cookie']) {
                const response = await fetch(`http://localhost:65535/profile/${cookies['login_cookie']}/${tag}`, {
                    method: "GET",
                });
                const pjson = await response.json();
                console.log("PJSON:", pjson);
                setProfileData(pjson.profile);
                if (pjson.profile) {
                  setFollowing(pjson.profile.followingStatus);
                }
            }
        };

        fetchProfile();
    }, [following]);

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

    if (!cookies.login_cookie) {
        return (
          <div className="text-center flex flex-col bg-white border shadow-sm rounded-xl p-6">
            <h2 className="font-bold text-gray-800 cursor-pointer" onClick={goToLogin}>
              Log in to view user profiles.
            </h2>
          </div>
        );
    } else if (profileData) {
        console.log(profileData);
        return (
            <div class="p-16">
<div class="p-8 bg-white border shadow-sm rounded-xl mt-24">
  <div class="grid grid-cols-1 md:grid-cols-3">
    <div class="grid grid-cols-3 text-center order-last md:order-first mt-20 md:mt-0">
      <div>
        <p class="font-bold text-gray-700 text-xl">{profileData.followersCount}</p>
        <p class="text-gray-400">Followers</p>
      </div>
      <div>
           <p class="font-bold text-gray-700 text-xl">{profileData.followeesCount}</p>
        <p class="text-gray-400">Following</p>
      </div>
          <div>
           <p class="font-bold text-gray-700 text-xl">{profileData.badges.length}</p>
        <p class="text-gray-400">Badges</p>
      </div>
    </div>
    <div class="relative">
      <div class="w-48 h-48 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500">
<img src={profileData.pfp_url} style={{ borderRadius : "50%" }} viewBox="0 0 20 20"/>
      </div>
    </div>

    <div class="space-x-8 flex justify-between mt-32 md:mt-0 md:justify-center">
{tag === cookies['login_cookie'] ? <></> : <button onClick={followToggle}
  class="text-white py-2 px-4 uppercase rounded bg-blue-400 hover:bg-blue-500 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
>
  {following ? "Unfollow" : "Follow"}
</button>}

    </div>
  </div>

  <div class="mt-20 text-center pb-12">
    <h1 class="text-4xl font-medium text-gray-700">{tag}, <span class="font-light text-gray-500">{profileData.age}</span></h1>
    <p class="font-light text-gray-600 mt-3">{profileData.bio}</p>

    <p class="mt-8 text-gray-500">(We could put recent posts here once we make up an endpoint for specific user posts. Didn't want to touch this right now while you guys are working on other posts functionality.)</p>
  </div>

  {/* <div class="mt-12 flex flex-col justify-center">
    <p class="text-gray-600 text-center font-light lg:px-16">An artist of considerable range, Ryan — the name taken by Melbourne-raised, Brooklyn-based Nick Murphy — writes, performs and records all of his own music, giving it a warm, intimate feel with a solid groove structure. An artist of considerable range.</p>
    <button
  class="text-indigo-500 py-2 px-4  font-medium mt-4"
>
  Show more
</button>
  </div> */}

</div>
</div>
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