import { useEffect, useState } from "react";
const Stats = () => {
  const [postedAboutAll, setPostedAboutAll] = useState([]);
  const [totalPostsPerAge, setTotalPostsPerAge] = useState(null);
  const [totalNSFWPostsByActiveUsers, setTotalNSFWPostsByActiveUsers] =
    useState(null);
  const [mostExpensiveArtPieces, setMostExpensiveArtPieces] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      const response = await fetch("http://localhost:65535/stats", {
        method: "GET",
      });
      const pjson = await response.json();
      setPostedAboutAll(pjson.postedAboutAll);
      setTotalPostsPerAge(pjson.totalPostsPerAge);
      setTotalNSFWPostsByActiveUsers(pjson.totalNSFWPostsByActiveUsers);
      setMostExpensiveArtPieces(pjson.mostExpensiveArtPieces);
    };
    getStats();
  }, []);

  return (
    <div className="p-8 py-12">
      <div className="flex flex-col bg-white border shadow-sm rounded-xl text-left p-8">
        <p className="font-bold text-xl">Stats</p>
        <p>All-time stats and fun facts.</p>
        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          <div className="flex flex-col bg-sky-200 border border-sky-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Know-it-alls</p>
            <p>Users who have posted about all art pieces.</p>
            <div className="flex flex-col mt-3">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-sky-100 text-gray-500 uppercase"
                          >
                            Username
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {postedAboutAll.map((user) => {
                          return (
                            <tr key={user}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 hover:text-sky-500 bg-sky-50">
                                <a href={"/profile/" + user}>{user}</a>
                              </td>
                            </tr>
                          );
                        })}

                        {postedAboutAll.length === 0 ? (
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 bg-sky-50">
                              No one yet.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-green-200 border border-green-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Prolific Posters</p>
            <p>Most active age groups.</p>
            <div className="flex flex-col mt-3">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-green-100 text-gray-500 uppercase"
                          >
                            Age
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-green-100 text-gray-500 uppercase"
                          >
                            # Posts
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {totalPostsPerAge?.map(({ age, count }) => {
                          return (
                            <tr key={age}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium bg-green-50">
                                {age}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium bg-green-50">
                                {count}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-rose-200 border border-rose-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Age Restricted Posts</p>
            <p>Total age restricted posts per age group with active users.</p>
            <div className="flex flex-col mt-3">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-rose-100 text-gray-500 uppercase"
                          >
                            Age
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-rose-100 text-gray-500 uppercase"
                          >
                            # Posts
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {totalNSFWPostsByActiveUsers?.map(({ age, count }) => {
                          return (
                            <tr key={age}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium bg-rose-50">
                                {age}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium bg-rose-50">
                                {count}
                              </td>
                            </tr>
                          );
                        })}
                        {totalNSFWPostsByActiveUsers?.length === 0 ? (
                          <tr>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 bg-rose-50"
                              colSpan={2}
                            >
                              No ages with active users yet.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-violet-200 border border-violet-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Pretty Pennies</p>
            <p>
              Cost of most expensive art pieces created in a year with at least
              3 pieces made.
            </p>
            <div className="flex flex-col mt-3">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-violet-100 text-gray-500 uppercase"
                          >
                            Year
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium bg-violet-100 text-gray-500 uppercase"
                          >
                            Price ($)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mostExpensiveArtPieces.map(({ year, cost }) => {
                          return (
                            <tr key={year}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium bg-violet-50">
                                {year}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium bg-violet-50">
                                {cost}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Stats;
