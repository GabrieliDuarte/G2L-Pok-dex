import { Navigate } from "react-router-dom";
import { estaLogado } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  if (!estaLogado()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
