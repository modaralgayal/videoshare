import { useEffect, useState } from "react";
import { connectToBackend } from "./controllers/user";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/signIn";
import { Home } from "./pages/home";
import { Jobs } from "./pages/jobs";

function App() {
  const [answer, setAnswer] = useState("No answer");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    connectToBackend()
      .then((res) => {
        console.log("This is the response", res);
        setAnswer(res || "Message not received");
      })
      .catch((err) => {
        setError(err?.message || err);
      });
  }, []);

  return (
    <>
      <Routes>
        <Route path="/signin" element={<SignIn />} />

        <Route path="/" element={<Home />} />

        <Route path="/jobs" element={<Jobs />} />
      </Routes>
    </>
  );
}

export default App;
