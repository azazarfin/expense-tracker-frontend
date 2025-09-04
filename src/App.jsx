import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAddExpensePage from './pages/AdminAddExpensePage'; // Make sure this is imported
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HistoryPage from './pages/HistoryPage';

// This helper component is now safer and will work correctly
const HomeRedirect = () => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error("Corrupted user data in localStorage", e);
        localStorage.removeItem('user');
    }

    if (!user || !user.token) {
        return <Navigate to="/login" />;
    }

    return user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Member's Protected Route */}
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* --- CORRECTED ADMIN ROUTES --- */}
          {/* We create a parent '/admin' route protected by AdminRoute */}
          <Route path="/admin" element={<AdminRoute />}>
            {/* The child paths are now relative */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="add-expense" element={<AdminAddExpensePage />} />
          </Route>

          <Route path="/history" element={<PrivateRoute />}>
             <Route path="/history" element={<HistoryPage />} />
          </Route>
          
          {/* Default route uses our robust redirector */}
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;