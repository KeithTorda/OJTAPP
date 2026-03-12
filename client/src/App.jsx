import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Dashboard from './pages/Dashboard';
import LogInput from './pages/LogInput';
import Login from './pages/Login';
import Register from './pages/Register';
import Logs from './pages/Logs';
import LogDetail from './pages/LogDetail';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-background-dark"></div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          
          <Route path="/add" element={
            <PrivateRoute><LogInput /></PrivateRoute>
          } />

          {/* Completed Routes */}
          <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
          <Route path="/log/:id" element={<PrivateRoute><LogDetail /></PrivateRoute>} />
          <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
