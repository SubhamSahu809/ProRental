import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Spinner from "./components/Spinner";
import Home from "./pages/Home";

// Code-split everything except the home page so first load stays small
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const AddPropertyPage = lazy(() => import("./pages/AddProperty"));
const EditPropertyPage = lazy(() => import("./pages/EditProperty"));
const MyProperties = lazy(() => import("./pages/MyProperties"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const LoginPage = lazy(() => import("./pages/Login"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/property/:id/edit" element={<EditPropertyPage />} />
          <Route path="/add-property" element={<AddPropertyPage />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
