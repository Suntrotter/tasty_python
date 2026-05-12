import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function getFriendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("auth/invalid-credential")) {
    return "Invalid email or password.";
  }

  if (message.includes("auth/user-not-found")) {
    return "No account found with this email.";
  }

  if (message.includes("auth/wrong-password")) {
    return "Wrong password.";
  }

  if (message.includes("auth/popup-closed-by-user")) {
    return "Google sign-in was closed before finishing.";
  }

  return "Could not sign in. Please try again.";
}

function LoginPage() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await loginWithEmail(form.email, form.password);
      navigate("/tracks");
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleSubmitting(true);
    setErrorMessage("");

    try {
      await loginWithGoogle();
      navigate("/tracks");
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to Tasty Python</h1>

        <p>
          Continue your Python learning path, keep your progress, and return to
          your next tasty concept.
        </p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}

        <form className="auth-form" onSubmit={handleEmailLogin}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="button button-secondary auth-google-button"
          onClick={handleGoogleLogin}
          disabled={isGoogleSubmitting}
        >
          {isGoogleSubmitting ? "Opening Google..." : "Continue with Google"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;