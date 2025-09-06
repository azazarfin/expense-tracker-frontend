import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api'; // Using the centralized API client
import Footer from '../components/Footer'; // Import the Footer

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', formData); // Correct API endpoint and client
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Logged in successfully');
        if (response.data.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-handwritten text-blue-500 dark:text-blue-400 mb-2 text-center">Meal Expense Tracker</h1>
        <h2 className="text-3xl font-handwritten text-green-600 dark:text-green-400 mb-10 text-center">Welcome!</h2>
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600 p-8 rounded-lg shadow-md flex flex-col items-center">
          <p className="text-2xl font-handwritten text-blue-600 dark:text-blue-400 mb-6">Login form</p>
          <form onSubmit={onSubmit} className="w-full">
            <div className="mb-4">
              <input type="email" name="email" placeholder="Email Address" value={email} onChange={onChange} required className="w-full px-4 py-2 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-lg" />
            </div>
            <div className="mb-6">
              <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required className="w-full px-4 py-2 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-lg" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-handwritten text-2xl">Log In</button>
          </form>
        </div>
        <p className="mt-8 text-lg font-handwritten text-gray-700 dark:text-gray-300 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline dark:text-blue-400">Register Now 😊</Link>
        </p>
      </div>
      <div className="mt-auto"> {/* Pushes footer to the bottom */}
        <Footer />
      </div>
    </div>
  );
}

export default LoginPage;