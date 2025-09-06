import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAddExpensePage from './pages/AdminAddExpensePage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HistoryPage from './pages/HistoryPage';

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
        <ToastContainer theme="colored" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="add-expense" element={<AdminAddExpensePage />} />
          </Route>

          <Route path="/history" element={<PrivateRoute />}>
             <Route path="/history" element={<HistoryPage />} />
          </Route>
          
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;