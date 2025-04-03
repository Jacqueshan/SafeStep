// src/Dashboard.js
import React, { useEffect, useState } from 'react';
import { auth, database } from './firebaseConfig';
import { ref, onValue, push, set, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
// Import Google Maps components
import { GoogleMap, LoadScript, Marker, Circle, Polyline } from '@react-google-maps/api';

function Dashboard({ user }) {
  const [dogs, setDogs] = useState([]);
  const [dogName, setDogName] = useState('');
  const [trackerId, setTrackerId] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState('');

  useEffect(() => {
    // Reference to this user's dogs in the database
    const userDogsRef = ref(database, 'users/' + user.uid + '/dogs');
    // Listen for real-time updates on dogs
    const unsubscribe = onValue(userDogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the dogs object into an array of {id, ...dogData}
        const dogsArray = Object.entries(data).map(([id, dogData]) => ({ id, ...dogData }));
        // If a geofence radius is set but center (lat,lng) is not yet set, initialize it to current location
        dogsArray.forEach(dog => {
          if (dog.geofence && dog.geofence.radius && dog.currentLocation && (!dog.geofence.lat || !dog.geofence.lng)) {
            update(ref(database, `users/${user.uid}/dogs/${dog.id}/geofence`), {
              lat: dog.currentLocation.lat,
              lng: dog.currentLocation.lng
            });
          }
        });
        setDogs(dogsArray);
      } else {
        setDogs([]);
      }
    });
    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [user.uid]);

  const handleAddDog = async (e) => {
    e.preventDefault();
    if (!dogName) return;
    // Create a new dog entry in the database with a unique key
    const newDogRef = push(ref(database, 'users/' + user.uid + '/dogs'));
    const newDogData = { name: dogName };
    if (trackerId) {
      newDogData.trackerId = trackerId;
    }
    if (geofenceRadius) {
      // Store geofence radius; center will be set to first known location
      newDogData.geofence = { radius: Number(geofenceRadius) };
    }
    try {
      await set(newDogRef, newDogData);
      // Clear the form
      setDogName('');
      setTrackerId('');
      setGeofenceRadius('');
    } catch (error) {
      console.error("Error adding dog:", error);
      alert(error.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  // Determine a sensible center for the map: use the first dog's location or default
  let initialCenter = { lat: 0, lng: 0 };
  if (dogs.length > 0 && dogs[0].currentLocation) {
    initialCenter = {
      lat: dogs[0].currentLocation.lat,
      lng: dogs[0].currentLocation.lng
    };
  }

  const mapContainerStyle = { width: '100%', height: '400px', marginTop: '1em' };

  return (
    <div className="dashboard">
      <h2>Welcome, {user.email}</h2>
      <button onClick={handleSignOut}>Log Out</button>

      <h3>Your Dogs:</h3>
      <ul>
        {dogs.map(dog => {
          // Check if dog is outside its geofence (if geofence is set)
          let outsideGeofence = false;
          if (dog.geofence && dog.geofence.radius && dog.currentLocation && dog.geofence.lat) {
            // Calculate distance from current location to geofence center using Haversine formula
            const R = 6371000; // Earth radius in meters
            const toRad = deg => deg * (Math.PI/180);
            const dLat = toRad(dog.currentLocation.lat - dog.geofence.lat);
            const dLng = toRad(dog.currentLocation.lng - dog.geofence.lng);
            const a = Math.sin(dLat/2)**2 + Math.cos(toRad(dog.geofence.lat)) * Math.cos(toRad(dog.currentLocation.lat)) * Math.sin(dLng/2)**2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            if (distance > dog.geofence.radius) {
              outsideGeofence = true;
            }
          }
          return (
            <li key={dog.id}>
              <strong>{dog.name}</strong>
              {dog.currentLocation ? (
                <> – Location: ({dog.currentLocation.lat.toFixed(5)}, {dog.currentLocation.lng.toFixed(5)})
                  {outsideGeofence && <span style={{ color: 'red' }}> Outside geofence!</span>}
                </>
              ) : (
                " – No location data yet"
              )}
            </li>
          );
        })}
      </ul>

      {/* Form to add a new dog */}
      <h4>Add a New Dog</h4>
      <form onSubmit={handleAddDog}>
        <div>
          <input 
            placeholder="Dog name" 
            value={dogName} 
            onChange={e => setDogName(e.target.value)} 
          />
        </div>
        <div>
          <input 
            placeholder="Tracker ID (optional)" 
            value={trackerId} 
            onChange={e => setTrackerId(e.target.value)} 
          />
        </div>
        <div>
          <input 
            type="number" 
            placeholder="Geofence radius (meters)" 
            value={geofenceRadius} 
            onChange={e => setGeofenceRadius(e.target.value)} 
          />
        </div>
        <button type="submit">Add Dog</button>
      </form>

      {/* Google Map showing the dogs */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap center={initialCenter} zoom={initialCenter.lat !== 0 ? 15 : 2} mapContainerStyle={mapContainerStyle}>
          {/* Markers for each dog's current location */}
          {dogs.map(dog => dog.currentLocation && (
            <Marker 
              key={dog.id} 
              position={{ lat: dog.currentLocation.lat, lng: dog.currentLocation.lng }} 
              label={dog.name} 
            />
          ))}
          {/* Geofence circles for each dog (if geofence is set and center available) */}
          {dogs.map(dog => dog.geofence && dog.geofence.lat && (
            <Circle 
              key={dog.id + '-geofence'} 
              center={{ lat: dog.geofence.lat, lng: dog.geofence.lng }} 
              radius={dog.geofence.radius} 
              options={{ fillColor: 'rgba(255,0,0,0.1)', strokeColor: 'red', strokeOpacity: 0.5 }}
            />
          ))}
          {/* Polylines for each dog's location history (if available) */}
          {dogs.map(dog => dog.history && (
            <Polyline 
              key={dog.id + '-history'} 
              path={Object.values(dog.history).map(pt => ({ lat: pt.lat, lng: pt.lng }))} 
              options={{ strokeColor: 'blue', strokeOpacity: 0.7 }} 
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Dashboard;
