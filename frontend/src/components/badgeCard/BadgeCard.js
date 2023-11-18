function BadgeCard({ badgeData }) {

	// NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
	// a component library example: https://freefrontend.com/tailwind-profiles/ . The code was not auto-generated, and we made significant
	// changes to the template to style it with our project's specific goals.
	return (
		<div className="flex flex-col justify-center max-w-xs p-6 shadow-md rounded-xl sm:px-12 bg-gray-50 text-gray-900">
			<img src={badgeData.icon_url} alt="" className="w-32 h-32 mx-auto rounded-full bg-gray-500 aspect-square" />
			<div className="space-y-4 text-center">
				<div className="my-2 space-y-1">
					<h2 className="text-xl font-semibold sm:text-2xl">{badgeData.name}</h2>
					<p className="px-5 text-xs sm:text-base text-gray-600">{badgeData.description}</p>
				</div>
			</div>
		</div>
	);
}

export default BadgeCard;