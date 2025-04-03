import React, { useState } from 'react';
import {
  HomeIcon,
  LocationMarkerIcon,
  UserIcon, 
  CogIcon,
  LogoutIcon,
  ExclamationIcon
} from '@heroicons/react/outline';

function DogTrackerDashboard() {
  // State to track if dog is outside the geofence (controls SOS visibility)
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);

  // Navigation items for the sidebar menu
  const navigationItems = [
    { name: 'Home', icon: HomeIcon, current: true },
    { name: 'Geofencing', icon: LocationMarkerIcon, current: false },
    { name: 'Pet Profile', icon: UserIcon, current: false },
    { name: 'Settings', icon: CogIcon, current: false },
    { name: 'Log Out', icon: LogoutIcon, current: false }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
        {/* Sidebar Header / Brand */}
        <div className="flex items-center h-16 px-4 bg-white border-b border-gray-200">
          <h1 className="text-lg font-bold">Dog Tracker</h1>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <a 
              key={item.name}
              href="#"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
                ${item.current 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <item.icon 
                className={`h-5 w-5 mr-3 ${item.current 
                    ? 'text-indigo-600' 
                    : 'text-gray-400 group-hover:text-gray-900'
                }`} 
                aria-hidden="true" 
              />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Bar (shown on small screens instead of sidebar) */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => {/* toggle mobile menu (if implemented) */}}
          >
            {/* Hamburger menu icon */}
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base font-bold">Dog Tracker</h1>
          <div /> {/* Placeholder for right-side icons or profile */}
        </header>

        <main className="flex-1 p-6">
          {/* SOS Alert Banner (only visible when dog is outside geofence) */}
          {isOutsideGeofence && (
            <div 
              className="mb-4 flex items-center justify-between bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" 
              role="alert"
            >
              <div className="flex items-center">
                <ExclamationIcon className="h-6 w-6 text-red-700 mr-2" aria-hidden="true" />
                <span className="font-medium">Alert:</span>
                <span className="ml-1">Dog is outside the geofence zone!</span>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded">
                SOS
              </button>
            </div>
          )}

          {/* Main content (placeholder) */}
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <p className="text-gray-700">
            Welcome to the Dog Tracker app dashboard.
          </p>
        </main>
      </div>
    </div>
  );
}

export default DogTrackerDashboard;
