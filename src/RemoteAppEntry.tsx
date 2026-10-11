import "./index.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home.page.tsx";
import Tool from "./pages/tool/Tool.page.tsx";

export default function RemoteAppEntry() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="tool" element={<Tool />} />
    </Routes>
  );
}
