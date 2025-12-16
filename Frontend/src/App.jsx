import { useEffect, useState } from "react";
import { connectToBackend } from "./controllers/user";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/signIn";
import { Home } from "./pages/home";
import { Jobs } from "./pages/jobs";
import { MakeBid } from "./pages/makeBid";
import PostJob from "./pages/PostJob";
import Navbar from "./components/Navbar";

function App() {
  const [answer, setAnswer] = useState("No answer");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Don't show navbar on sign-in page
  const showNavbar = location.pathname !== "/signin";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/make-bid" element={<MakeBid />} />
      </Routes>
    </>
  );
}

export default App;
