import { useEffect, useState } from "react";
import { connectToBackend } from "./controllers/user";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/signIn";
import { Home } from "./pages/home";
import { Jobs } from "./pages/jobs";
import { MakeBid } from "./pages/makeBid";
import PostJob from "./pages/PostJob";
import ViewBids from "./pages/ViewBids";
import MyBids from "./pages/MyBids";
import Portfolio from "./pages/Portfolio";
import ViewPhotographerPortfolio from "./pages/ViewPhotographerPortfolio";
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
      <div style={{ paddingTop: showNavbar ? "73px" : "0" }}>
        <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/make-bid" element={<MakeBid />} />
        <Route path="/view-bids" element={<ViewBids />} />
        <Route path="/my-bids" element={<MyBids />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/photographer/:photographerId/portfolio" element={<ViewPhotographerPortfolio />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
