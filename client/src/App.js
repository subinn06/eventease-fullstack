import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MyBookings from './pages/MyBookings';
import Header from './components/Header';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/dashboard" element={<OrganizerDashboard />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
