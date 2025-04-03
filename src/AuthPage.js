// src/AuthPage.js
import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);  // toggle between login and sign-up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleMode = () => {
    setIsRegistering(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      // Sign up flow
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Firebase will automatically log the user in after sign-up
      } catch (error) {
        console.error("Error signing up:", error);
        alert(error.message);
      }
    } else {
      // Login flow
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged in App.js will handle redirecting to dashboard
      } catch (error) {
        console.error("Error signing in:", error);
        alert(error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // If successful, user is logged in with Google
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <h2>{ isRegistering ? "Register" : "Login" }</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: 
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </label>
        </div>
        <div>
          <label>Password: 
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </label>
        </div>
        { isRegistering && 
          <div>
            <label>Confirm Password: 
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </label>
          </div>
        }
        <button type="submit">
          { isRegistering ? "Sign Up" : "Log In" }
        </button>
      </form>

      <button onClick={toggleMode}>
        { isRegistering ? "Already have an account? Log In" : "Need an account? Sign Up" }
      </button>

      <hr />

      {/* Google Sign-In */}
      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </div>
  );
}

export default AuthPage;
