import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FarmerRegister from "../src/Farmer/FarmerRegister";
import FarmerLogin from "./Farmer/FarmerLogin";
import FarmerSidebar from "./Farmer/FarmerSidebar";
import FarmerProfile from "./Farmer/FarmerProfile";
import FarmerCrop from "./Farmer/FarmerCrop";
import FarmerDashboard from "./Farmer/FarmerDashboard";


// Create a new component for the dashboard content
function DashboardContent() {
  return <FarmerDashboard />;
}


function FarmerDashboardLayout() {
  return (
    <FarmerSidebar>
      {/* Your dashboard content will be rendered here */}
      <Routes>
        <Route path="/dashboard" element={<DashboardContent />} />
        <Route path="/profile" element={<FarmerProfile />} />
        <Route path="/crops" element={<FarmerCrop />} />
      </Routes>
    </FarmerSidebar>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* Farmer Registration route */}
        <Route path="/" element={<FarmerRegister />} />

         {/* Farmer login route */}
        <Route path="/login" element={<FarmerLogin />} />

        {/* Farmer dashboard route with nested routes */}
        <Route path="/farmer/*" element={<FarmerDashboardLayout />} />

        


      </Routes>
    </Router>
  );
}

export default App;
