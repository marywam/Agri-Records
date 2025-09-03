import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FarmerRegister from "../src/Farmer/FarmerRegister";
import FarmerLogin from "./Farmer/FarmerLogin";

function App() {
  return (
    <Router>
      <Routes>
       

        {/* Farmer Registration route */}
        <Route path="/" element={<FarmerRegister />} />

         {/* Farmer login route */}
        <Route path="/login" element={<FarmerLogin />} />

      </Routes>
    </Router>
  );
}

export default App;
