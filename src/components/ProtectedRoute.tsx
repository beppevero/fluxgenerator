
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const auth = useAuth();

  if (!auth) {
    // Auth context is not available yet
    return <div>Loading...</div>; 
  }

  const { user, loading } = auth;

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
