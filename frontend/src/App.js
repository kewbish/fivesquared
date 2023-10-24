import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    const fetchDBConnectionStatus = async () => {
      const response = await fetch(
        "http://localhost:65535/check-db-connection",
        {
          method: "GET",
        }
      );
      const text = await response.text();
      setStatus(text);
    };

    fetchDBConnectionStatus();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Status: {status}</p>
      </header>
    </div>
  );
}

export default App;
