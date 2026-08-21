import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("https://commandcenter.rivotmotors.com/checkAuth.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.authenticated === true) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        if (isMounted) setAuthenticated(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Checking authentication…
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/" replace />;
}
