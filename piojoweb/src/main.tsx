import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Tema UTVT: variables y utilidades (importar después de index.css para sobreescribir)
import "./themes/utvt-theme.css";

createRoot(document.getElementById("root")!).render(<App />);
