import { Route, Routes, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const isSignIn = location.pathname === "/signin";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ paddingTop: isSignIn ? 0 : "64px", flex: 1, display: "flex", flexDirection: "column" }}>
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
