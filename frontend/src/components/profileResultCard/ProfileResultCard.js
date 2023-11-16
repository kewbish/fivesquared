function ProfileResultCard({profileData}) {

  // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
  // a component library example: https://freefrontend.com/tailwind-profiles/ . The code was not auto-generated, and we made significant
  // changes to the template to style it with our project's specific goals.
    return(
<div className="flex flex-col justify-center max-w-xs p-6 shadow-md rounded-xl sm:px-12 bg-gray-50 text-gray-900">
	<img src={profileData.pfp_url} alt="" className="w-32 h-32 mx-auto rounded-full bg-gray-500 aspect-square" />
	<div className="space-y-4 text-center divide-y dark:divide-gray-700">
		<div className="my-2 space-y-1">
			<h2 className="text-xl font-semibold sm:text-2xl">{profileData.username}</h2>
			<p className="px-5 text-xs sm:text-base text-gray-600">{profileData.bio}</p>
		</div>
		<div className="flex justify-center pt-2 space-x-4 align-center">
		<a className="cursor-pointer underline text-gray-400" href={"/" + profileData.username}>View profile</a>
		</div>
	</div>
</div>
    );
}

export default ProfileResultCard;