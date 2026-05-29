import { createBrowserRouter } from "react-router-dom"; 
import Home from "../pages/Home";
import Cadastro from "../pages/Cadastro"
import App from "../App"
import DashBoard from "../pages/DashBoard";

const router = createBrowserRouter([
    {path: "/", element: <Home />},
    {path: "/cadastro", element: <Cadastro />},
    {path: "/dashboard", element: <DashBoard />},
])

export default router;