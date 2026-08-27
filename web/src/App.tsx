import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { Boote } from "./pages/Boote";
import { Dashboard } from "./pages/Dashboard";
import { Ergebnisse } from "./pages/Ergebnisse";
import { Wettfahrten } from "./pages/Wettfahrten";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/boote" element={<Boote />} />
        <Route path="/wettfahrten" element={<Wettfahrten />} />
        <Route path="/ergebnisse" element={<Ergebnisse />} />
      </Routes>
    </AppShell>
  );
}

export default App;
