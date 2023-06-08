import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import InputForm from "./components/InputForm";
import OutputForm from "./components/OutputForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputForm />} />
        <Route path="/output" element={<OutputForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
