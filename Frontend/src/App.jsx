import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AddPropertyPage from "./pages/AddProperty.jsx";
import LoginPage from "./pages/Login.jsx";
import Property from "./components/Property.jsx";
import MyProperties from "./pages/MyProperties.jsx";
import EditPropertyPage from "./pages/EditProperty.jsx";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-property" element={<AddPropertyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/property/:id" element={<Property />} />
        <Route path="/property/:id/edit" element={<EditPropertyPage />} />
        <Route path="/my-properties" element={<MyProperties />} />
      </Routes>
    </>
  );
}

export default App;
