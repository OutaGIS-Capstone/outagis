import { useEffect, useState } from "react";
import { Routes, Route } from 'react-router-dom';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Home from './pages/Home';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Info from './pages/Info';
import Tabs from "./components/Tabs";
import ResponsiveAppBar from "./components/ResponsiveAppBar";

import "./App.css";

// URL routing reference: https://hygraph.com/blog/routing-in-react

function App() {
   return (
      <main>
	    <ResponsiveAppBar />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/info" element={<Info />} />
         </Routes>
      </main>
   );
};

export default App;
