import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Legend from "./pages/Legend";
import Report from "./pages/Report";
import Reports from "./pages/Reports";
import DenunciaDetail from "./pages/DenunciaDetail";
import EditProfile from "./pages/EditProfile";

function PrivateRoute({ children }) {
  return sessionStorage.getItem("user") ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home"             element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/legend"           element={<PrivateRoute><Legend /></PrivateRoute>} />
        <Route path="/report"           element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/reports"          element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/denuncia/:id"     element={<PrivateRoute><DenunciaDetail /></PrivateRoute>} />
        <Route path="/perfil/editar"    element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
