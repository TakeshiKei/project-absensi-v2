import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import InputForm from "./components/InputForm";
import OutputForm from "./components/OutputForm";
import Activity from "./components/Activity";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputForm />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/output" element={<OutputForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
