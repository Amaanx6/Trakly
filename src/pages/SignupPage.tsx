// In src/pages/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Chrome, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import { API_URL } from '../config/constants';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const years = ['1st', '2nd', '3rd', '4th'];
  const branches = ['IT', 'CSE', 'CSE AIML', 'CSD', 'EEE', 'ECE', 'ME'];

  const validateFields = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!password.trim()) errors.password = 'Password is required';
    if (!college.trim()) errors.college = 'College is required';
    if (!year) errors.year = 'Year is required';
    if (!branch) errors.branch = 'Branch is required';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await signup(email, password, name, college, year, branch);
      localStorage.setItem("email", email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = () => {
    console.log('SignupPage: Initiating Google OAuth');
    window.location.href = `${API_URL}/api/auth/google?action=signup`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-white">
          <BookOpen className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold">Trakly</span>
        </Link>
      </div>

      <div className="glass-card w-full max-w-md p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter your name"
              aria-label="Name"
              required
            />
            {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="you@example.com"
              aria-label="Email"
              required
            />
            {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              aria-label="Password"
              required
            />
            {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="college" className="block text-sm font-medium text-slate-300 mb-1">
              College
            </label>
            <input
              type="text"
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g., LIET"
              aria-label="College"
              required
            />
            {fieldErrors.college && <p className="text-red-400 text-xs mt-1">{fieldErrors.college}</p>}
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-300 mb-1">
              Year
            </label>
            <div className="relative">
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input-field appearance-none w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-500"
                aria-label="Year"
                required
              >
                <option value="" disabled>
                  Select Year
                </option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            {fieldErrors.year && <p className="text-red-400 text-xs mt-1">{fieldErrors.year}</p>}
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-slate-300 mb-1">
              Branch
            </label>
            <div className="relative">
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="input-field appearance-none w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-500"
                aria-label="Branch"
                required
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            {fieldErrors.branch && <p className="text-red-400 text-xs mt-1">{fieldErrors.branch}</p>}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="border-2 border-primary-500 w-48 hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-slate-400 bg-[#1e293b]">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Chrome className="h-5 w-5" />
            Sign Up with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;