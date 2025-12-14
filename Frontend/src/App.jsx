import { useEffect, useState } from "react";
import { connectToBackend } from "./controllers/user";
import "./App.css";

function App() {
  const [answer, setAnswer] = useState("No answer");
  const [error, setError] = useState(null);

  useEffect(() => {
    connectToBackend()
      .then((res) => {
        console.log("This is the response", res);
        setAnswer(res || "Message not received");
      })
      .catch((err) => {
        setError(err?.message || err);
      });
  });

  return (
    <>
      {error && <div>{error}</div>}

      <h1>{answer}</h1>
    </>
  );
}

export default App;
