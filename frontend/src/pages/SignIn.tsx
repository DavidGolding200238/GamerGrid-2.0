import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Header } from "../components/Header";

export default function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('Starting login process...');
      await authService.login({
        username: formData.username,
        password: formData.password,
      });

      console.log('Login successful, redirecting to games page...');
      // Login successful - redirect to games page
      navigate("/games");
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header variant="centeredLogo" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h3 className="text-white font-montserrat text-2xl lg:text-3xl font-bold tracking-wider mb-4 uppercase">
              Welcome Back
            </h3>
            <p className="text-white/70 font-jost text-base lg:text-lg">
              Sign in to access your gaming profile.
            </p>
          </div>

          {/* Sign In Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="sr-only">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="relative block w-full px-4 py-3 border border-white/20 bg-background rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-jost"
                placeholder="Username or Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="relative block w-full px-4 py-3 border border-white/20 bg-background rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-jost"
                placeholder="Password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-white/20 rounded bg-background"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70 font-jost">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-accent hover:text-accent/80 font-jost font-bold uppercase tracking-wider">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-black bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background transition-colors duration-200 font-jost font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-white/60 font-jost text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-accent hover:text-accent/80 font-bold uppercase tracking-wider"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
