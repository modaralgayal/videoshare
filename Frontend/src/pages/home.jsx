import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectToBackend } from "../controllers/user";

export const Home = () => {
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    connectToBackend()
      .then((res) => {
        console.log(res);
        setAnswer(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <>
      {error && <div>{error}</div>}

      <h1>{answer}</h1>
      <button onClick={() => navigate("/signin")}> Go to SignIn </button>
      <button onClick={() => navigate("/jobs")}> Look for open Jobs </button>
    </>
  );
};
