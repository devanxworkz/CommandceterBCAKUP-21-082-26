import "./App.css";
import RealTimeChart from "./Components/RealTimeChart";
import Login from "./Components/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RealTimeChart />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
