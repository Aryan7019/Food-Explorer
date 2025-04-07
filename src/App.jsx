import './App.css'
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Product from "./components/Product";

function App(){
  return (
 <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<Product />} />
    </Routes>
 </Router>
  )
}

export default App
