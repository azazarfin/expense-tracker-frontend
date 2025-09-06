import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/users/login', formData);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-white">Meal Expense Tracker</h1>
                <p className="text-2xl text-green-400 mt-2">Welcome!</p>
            </div>
            <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 border border-blue-500 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold text-center text-white">Login form</h2>
                <form className="space-y-4" onSubmit={onSubmit}>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Email Address"
                        required
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Password"
                        required
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                        Log In
                    </button>
                </form>
            </div>
            <p className="mt-6 text-center text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                    Register Now 😉
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;