import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { Zugangssperre } from "./components/Zugangssperre.tsx";
import { DataProvider } from "./state/DataContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Die Sperre liegt innerhalb des Providers, damit der Anmeldeschirm
          das Veranstalterlogo der aktiven Regatta zeigen kann. */}
      <DataProvider>
        <Zugangssperre>
          <App />
        </Zugangssperre>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
