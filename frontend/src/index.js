import React from "react";
import ReactDOM from "react-dom/client";
// 👇 CHANGED: 'index.css' to 'styles.css' to match your actual file
import "./styles.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
