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
      //const pjson = await response.json();
      const pjson = {
        postedAboutAll: ["kewbish", "johnnie_banks"],
        totalPostsPerAge: [
          { age: 17, count: 40 },
          { age: 20, count: 2 },
        ],
        totalNSFWPostsByActiveUsers: [
          { age: 17, count: 40 },
          { age: 20, count: 2 },
        ],
        mostExpensiveArtPieces: [
          { year: 2000, cost: "$3,000,000" },
          { year: 2012, cost: "$4,100,000" },
        ],
      };
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
        <div class="grid grid-cols-2 gap-x-10 gap-y-4">
          <div class="flex flex-col bg-sky-200 border border-sky-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Know-it-alls</p>
            <p>Users who have posted about all art pieces.</p>
            <div class="flex flex-col mt-3">
              <div class="-m-1.5 overflow-x-auto">
                <div class="p-1.5 min-w-full inline-block align-middle">
                  <div class="border rounded-lg overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-sky-100 text-gray-500 uppercase"
                          >
                            Username
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        {postedAboutAll.map((user) => {
                          return (
                            <tr key={user}>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 hover:text-sky-500 bg-sky-50">
                                <a href={"/" + user}>{user}</a>
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
          <div class="flex flex-col bg-green-200 border border-green-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Prolific Posters</p>
            <p>Most active age groups.</p>
            <div class="flex flex-col mt-3">
              <div class="-m-1.5 overflow-x-auto">
                <div class="p-1.5 min-w-full inline-block align-middle">
                  <div class="border rounded-lg overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-green-100 text-gray-500 uppercase"
                          >
                            Age
                          </th>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-green-100 text-gray-500 uppercase"
                          >
                            # Posts
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        {totalPostsPerAge?.map(({ age, count }) => {
                          return (
                            <tr key={age}>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium bg-green-50">
                                {age}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium bg-green-50">
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
          <div class="flex flex-col bg-rose-200 border border-rose-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Age Restricted Posts</p>
            <p>Total age restricted posts per age group with active users.</p>
            <div class="flex flex-col mt-3">
              <div class="-m-1.5 overflow-x-auto">
                <div class="p-1.5 min-w-full inline-block align-middle">
                  <div class="border rounded-lg overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-rose-100 text-gray-500 uppercase"
                          >
                            Age
                          </th>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-rose-100 text-gray-500 uppercase"
                          >
                            # Posts
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        {totalNSFWPostsByActiveUsers?.map(({ age, count }) => {
                          return (
                            <tr key={age}>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium bg-rose-50">
                                {age}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium bg-rose-50">
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
          <div class="flex flex-col bg-violet-200 border border-violet-300 shadow-sm rounded-xl p-4 md:p-5 mt-3">
            <p className="font-bold text-l">Pretty Pennies</p>
            <p>
              Cost of most expensive art pieces sold in a year with more than 3
              sales.
            </p>
            <div class="flex flex-col mt-3">
              <div class="-m-1.5 overflow-x-auto">
                <div class="p-1.5 min-w-full inline-block align-middle">
                  <div class="border rounded-lg overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-violet-100 text-gray-500 uppercase"
                          >
                            Year
                          </th>
                          <th
                            scope="col"
                            class="px-6 py-3 text-start text-xs font-medium bg-violet-100 text-gray-500 uppercase"
                          >
                            Price ($)
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        {mostExpensiveArtPieces.map(({ year, cost }) => {
                          return (
                            <tr key={year}>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium bg-violet-50">
                                {year}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium bg-violet-50">
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
