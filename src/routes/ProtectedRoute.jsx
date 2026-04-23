/**
 * routes/ProtectedRoute.jsx
 * Role-based route guard for DahabNow.
 *
 * Behaviour:
 *   - Shows GoldSpinner while auth state is initialising
 *   - Redirects to /login if the user is not authenticated or has the wrong role
 *   - Renders children when the role matches
 */

import { Navigate }   from "react-router-dom";
import { useAuth }    from "../context/AuthContext";
import GoldSpinner    from "../components/common/GoldSpinner";

/**
 * @param {React.ReactNode} children     - Protected page component(s)
 * @param {string}          requiredRole - "admin" | "seller"
 */
function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <GoldSpinner fullScreen />;

  if (!currentUser || userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
