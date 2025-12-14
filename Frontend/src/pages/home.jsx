import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectToBackend } from "../controllers/user";

export const Home = () => {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    connectToBackend()
      .then((res) => {
        setAnswer(res);
      })
      .catch((err) => {
        setError(err?.message || err);
      });
  }, []);

  return (
    <>
      {error && <div>{error}</div>}

      <h1>{answer}</h1>
      <button onClick={() => navigate("/signin")}> Go to SignIn </button>
    </>
  );
};
