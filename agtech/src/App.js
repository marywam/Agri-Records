import React from "react";
import { BrowserRouter as Router, Routes, Route , Navigate} from "react-router-dom";
import FarmerRegister from "../src/Farmer/FarmerRegister";
import FarmerLogin from "../src/Login";
import FarmerSidebar from "./Farmer/FarmerSidebar";
import FarmerProfile from "./Farmer/FarmerProfile";
import FarmerCrop from "./Farmer/FarmerCrop";
import FarmerDashboard from "./Farmer/FarmerDashboard";
import AdminSidebar from "./Admin/AdminSideBar";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminFarmersList from "./Admin/AdminFarmersList";
import AdminFarmersFormDialog from "./Admin/AminFarmersFormDialog";
import AdminCropsList from "./Admin/AdminCropsList";


// Create a new component for the dashboard content
function DashboardContent() {
  return <FarmerDashboard />;
}

// Simple guard (optional)
const requireAdmin = (element) => {
  const role = localStorage.getItem("user_role");
  if (role !== "admin") return <Navigate to="/login" replace />;
  return element;
};


const AdminRoutes = () => {
  return (
    <AdminSidebar>
      <Routes>
        <Route
          path="/dashboard"
          element={requireAdmin(<AdminDashboard/>)}
        />
        <Route path="/farmers" element={requireAdmin(<AdminFarmersList />)} />
        <Route path="/farmers/new" element={requireAdmin(<AdminFarmersFormDialog />)} />
        <Route path="/crops" element={requireAdmin(<AdminCropsList />)} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminSidebar>
  );
};



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
        <Route path="/" element={<FarmerLogin />} />

         {/* Farmer login route */}
        <Route path="/register" element={<FarmerRegister />} />

        {/* Farmer dashboard route with nested routes */}
        <Route path="/farmer/*" element={<FarmerDashboardLayout />} />

        {/* Admin dashboard route */}
        <Route path="/admin/*" element={<AdminRoutes/>} />


        


      </Routes>
    </Router>
  );
}

export default App;
