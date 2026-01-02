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
import ViewPhotographerProfile from "./pages/ViewPhotographerProfile";
import PhotographerProfile from "./pages/PhotographerProfile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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


  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      padding: 0,
    }}>
      <Navbar />
      <div 
        className={location.pathname === "/signin" ? "signin-page-wrapper" : ""}
        style={{ 
          paddingTop: "73px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/make-bid" element={<MakeBid />} />
        <Route path="/view-bids" element={<ViewBids />} />
        <Route path="/my-bids" element={<MyBids />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/photographer-profile" element={<PhotographerProfile />} />
        <Route path="/photographer/:photographerId/portfolio" element={<ViewPhotographerPortfolio />} />
        <Route path="/photographer/:photographerId/profile" element={<ViewPhotographerProfile />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
