function ProfileResultCard({profileData}) {


    return(
//         <div class="flex flex-col items-start space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 p-4 border rounded-lg">
//     <img class="object-cover w-20 h-20 mt-3 mr-3 rounded-full" src={profileData.pfp_url} />
//     <div>
//         <p class="font-display mb-2 text-2xl font-semibold text-black" itemprop="author">
//             <a href="#" rel="author">{profileData.username}</a>
//         </p>
//         <div class="mb-4 prose prose-sm text-gray-400">
//             <p>{profileData.bio}</p>
//         </div>

//     </div>
// </div>

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