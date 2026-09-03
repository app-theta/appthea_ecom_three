import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthed, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: '#6b7280' }}>
        Loading…
      </div>
    );
  }
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
