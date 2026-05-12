import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function getFriendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("auth/email-already-in-use")) {
    return "This email is already registered.";
  }

  if (message.includes("auth/weak-password")) {
    return "Password should be at least 6 characters.";
  }

  if (message.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("auth/popup-closed-by-user")) {
    return "Google sign-in was closed before finishing.";
  }

  return "Could not create account. Please try again.";
}

function RegisterPage() {
  const navigate = useNavigate();
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await registerWithEmail(form.email, form.password);
      navigate("/tracks");
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
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
        <p className="eyebrow">Start your path</p>
        <h1>Create your Tasty Python account</h1>

        <p>
          Save your completed lessons and come back to the exact next Python
          bite.
        </p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}

        <form className="auth-form" onSubmit={handleRegister}>
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
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="button button-secondary auth-google-button"
          onClick={handleGoogleRegister}
          disabled={isGoogleSubmitting}
        >
          {isGoogleSubmitting ? "Opening Google..." : "Continue with Google"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;