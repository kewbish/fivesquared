import { useEffect, useState } from "react";

const Projection = () => {
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  useEffect(() => {
    const getTables = async () => {
      const tables = await fetch("http://localhost:65535/tables");
      const tJson = await tables.json();
      setTables(tJson.tables);
    };
    getTables();
  }, []);

  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  useEffect(() => {
    const getColumns = async () => {
      if (!currentTable) {
        return;
      }
      const columns = await fetch(
        `http://localhost:65535/tables/${currentTable}/columns`
      );
      const tJson = await columns.json();
      setColumns(tJson.columns);
      setSelectedColumns(
        Array.from({ length: tJson.columns.length }, (i) => (i = false))
      );
    };
    getColumns();
    setResults(null);
  }, [currentTable]);

  const [results, setResults] = useState(null);
  useEffect(() => {
    const execute = async () => {
      if (!currentTable) {
        return;
      }
      const filteredCols = columns.filter((_, i) => selectedColumns[i]);
      if (!filteredCols.length) {
        return;
      }
      const result = await fetch(
        `http://localhost:65535/tables/${currentTable}/visualize`,
        {
          method: "POST",
          body: JSON.stringify({
            columns: filteredCols,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const rJson = await result.json();
      setResults(rJson);
    };
    execute();
  }, [selectedColumns]);

  return (
    <div className="p-6">
      <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-5">
        <p class="text-lg font-bold text-gray-800">Visualize DB contents</p>
        <div class="hs-dropdown relative inline-flex mt-4">
          <button
            id="hs-dropdown-default"
            type="button"
            class="hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            {currentTable ?? "Select a table"}
            <svg
              class="hs-dropdown-open:rotate-180 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div
            class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-[15rem] bg-white shadow-md rounded-lg p-2 mt-2 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full"
            aria-labelledby="hs-dropdown-default"
          >
            {tables &&
              tables.map((table) => (
                <p
                  class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  key={table}
                  onClick={() => setCurrentTable(table)}
                >
                  {table}
                </p>
              ))}
          </div>
        </div>
        {columns.length ? (
          <div>
            {columns.map((column, i) => (
              <div class="flex mt-2" key={column}>
                <input
                  type="checkbox"
                  class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  onChange={() =>
                    setSelectedColumns((selCol) => [
                      ...selCol.slice(0, i),
                      !selCol[i],
                      ...selCol.slice(i, selCol.length),
                    ])
                  }
                  checked={selectedColumns[i]}
                />
                <label class="text-sm text-gray-500 ms-3">{column}</label>
              </div>
            ))}
          </div>
        ) : null}
        {results !== null ? (
          <div class="flex flex-col mt-4">
            <div class="-m-1.5 overflow-x-auto">
              <div class="p-1.5 min-w-full inline-block align-middle">
                <div class="border rounded-lg overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        {columns
                          .filter((_, i) => selectedColumns[i])
                          .map((column) => (
                            <th
                              scope="col"
                              class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                              key={column}
                            >
                              {column}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      {results.map((row, i) => (
                        <tr key={i}>
                          {row.map((el, j) => (
                            <td
                              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800"
                              key={j}
                            >
                              {el}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default Projection;
