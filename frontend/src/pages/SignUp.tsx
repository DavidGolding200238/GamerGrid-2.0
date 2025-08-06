import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

// Sign Up Page Component - User Registration Form
export default function SignUp() {
  // Form state management
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    displayName: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission and user registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('Starting registration process...');
      // Call backend API to create new user account
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.username,
      });

      console.log('Registration successful, redirecting to games page...');
      // Registration successful - redirect to games page
      navigate("/games");
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with Logo */}
      <header className="bg-game-grid-header shadow-[0_-1px_37px_0_rgba(129,129,129,0.25)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-center">
              <h1 className="text-white font-ethnocentric text-lg lg:text-2xl font-light leading-tight">
                THE
              </h1>
              <h2 className="text-white font-ethnocentric text-lg lg:text-2xl font-light leading-tight">
                GAME GRID
              </h2>
            </Link>
            
            {/* Back to Sign In */}
            <Link 
              to="/signin"
              className="text-white font-jost font-bold text-sm lg:text-base uppercase tracking-wider hover:text-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h3 className="text-white font-montserrat text-2xl lg:text-3xl font-bold tracking-wider mb-4 uppercase">
              Join the Grid
            </h3>
            <p className="text-white/70 font-jost text-base lg:text-lg">
              Create your account to access exclusive features.
            </p>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="relative block w-full px-4 py-3 border border-white/20 bg-background rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-jost"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="relative block w-full px-4 py-3 border border-white/20 bg-background rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-jost"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="displayName" className="sr-only">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="relative block w-full px-4 py-3 border border-white/20 bg-background rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-jost"
                placeholder="Display Name (optional)"
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
                placeholder="Password (min 6 characters)"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-black bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background transition-colors duration-200 font-jost font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-white/60 font-jost text-sm">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-accent hover:text-accent/80 font-bold uppercase tracking-wider"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
