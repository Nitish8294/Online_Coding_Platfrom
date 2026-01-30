import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser, loginStart, loginSuccess, loginFailure } from '../authSlice';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import axiosClient from '../utils/axiosClient';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum 3 characters required"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Minimum 8 characters required")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      dispatch(loginStart());
      const { data } = await axiosClient.post('/user/google', {
        firstName: user.displayName ? user.displayName.split(' ')[0] : 'User',
        emailId: user.email,
        lastName: user.displayName && user.displayName.split(' ')[1] ? user.displayName.split(' ')[1] : '',
      });

      dispatch(loginSuccess(data));
      navigate('/');
    } catch (error) {
      console.error("Google Login Error:", error);
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-slate-200 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="card w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 transition-all duration-300">
        <div className="card-body p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
              Join LeetCode
            </h2>
            <p className="text-slate-400">Create an account to verify your skills.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* First Name */}
            <div className="form-control">
              <label className="label pl-1">
                <span className="label-text text-slate-400 font-medium text-xs uppercase tracking-wider">First Name</span>
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`input input-bordered w-full bg-slate-950/50 border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-11 rounded-xl transition-all ${errors.firstName ? 'input-error' : ''}`}
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <span className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1">
                  • {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label pl-1">
                <span className="label-text text-slate-400 font-medium text-xs uppercase tracking-wider">Email Address</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`input input-bordered w-full bg-slate-950/50 border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-11 rounded-xl transition-all ${errors.emailId ? 'input-error' : ''}`}
                  {...register('emailId')}
                />
              </div>
              {errors.emailId && (
                <span className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1">
                  • {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label pl-1">
                <span className="label-text text-slate-400 font-medium text-xs uppercase tracking-wider">Password</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={`input input-bordered w-full bg-slate-950/50 border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-11 pr-12 rounded-xl transition-all ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1">
                  • {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={`btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-purple-500/20 rounded-xl h-12 text-base font-bold tracking-wide mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'transform active:scale-[0.98] transition-all'}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider text-slate-600 text-xs font-mono my-8">OR CONTINUE WITH</div>

          <button
            type="button"
            className="btn btn-outline w-full gap-3 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 h-12 rounded-xl font-medium transition-all"
            onClick={handleGoogleLogin}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22px" height="22px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Google
          </button>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Already have an account?{' '}
            <NavLink to="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-all">
              Login
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
