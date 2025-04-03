// src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import Dashboard from './Dashboard';
import AuthPage from './AuthPage';
import DogTrackerDashboard from './DogTrackerDashboard';



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes (login/logout)
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    // While checking auth state, show a loading message
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      { user ? <DogTrackerDashboard user={user} /> : <AuthPage /> }
    </div>
  );
}

export default App;
