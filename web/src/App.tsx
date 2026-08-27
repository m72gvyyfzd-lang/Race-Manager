import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { Einstellungen } from "./pages/Einstellungen";
import { Regatten } from "./pages/Regatten";
import { Teilnehmer } from "./pages/Teilnehmer";
import { Wertungen } from "./pages/Wertungen";
import { useData } from "./state/DataContext";

function App() {
  const { aktiveRegatta } = useData();

  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={aktiveRegatta ? "/teilnehmer" : "/regatten"} replace />}
        />
        <Route path="/teilnehmer" element={<Teilnehmer />} />
        <Route path="/einstellungen" element={<Einstellungen />} />
        <Route path="/regatten" element={<Regatten />} />
        <Route path="/wertungen" element={<Wertungen />} />
      </Routes>
    </AppShell>
  );
}

export default App;
