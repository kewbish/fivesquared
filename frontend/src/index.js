import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Posts from "./pages/posts/Posts";
import Nothing from "./pages/nothing/Nothing";
import Nav from "./pages/nav/Nav";
import Login from "./pages/login/Login";
import reportWebVitals from "./reportWebVitals";
import "preline";
import Profile from "./pages/profile/Profile";
import Signup from "./pages/signup/Signup";
import SearchResults from "./pages/search results/SearchResults";
import Piece from "./pages/piece/Piece";
import Location from "./pages/location/Location"
import Collection from "./pages/collection/Collection";
import Artist from "./pages/artist/Artist";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav />}>
          <Route index element={<Posts />} />
          <Route path="posts" element={<Posts />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path=":tag" element={<Profile />} />
          <Route path="piece/:term" element={<Piece />} />
          <Route path="artist/:id" element={<Artist />} />
          <Route path="location/:name" element={<Location />} />
          <Route path="collection/:title/:curator" element={<Collection />} />
          <Route path="search/:term" element={<SearchResults />} />
          <Route path="*" element={<Nothing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
