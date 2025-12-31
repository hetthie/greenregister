import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import MyPlants from './pages/MyPlants';
import CatalogDetail from './pages/CatalogDetail';
import PlantDetail from './pages/PlantDetail'
import RegisterActivity from './pages/RegisterActivity';
import ActivityHistory from './pages/ActivityHistory';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/catalog" 
            element={
              <PrivateRoute>
                <Catalog />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-plants" 
            element={
              <PrivateRoute>
                <MyPlants />
              </PrivateRoute>
            } 
          />
          <Route 
              path="/catalog/:id" 
              element={
                <PrivateRoute>
                  <CatalogDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-plants/:id" 
              element={
                <PrivateRoute>
                  <PlantDetail />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/my-plants/:id/register-activity" 
              element={
                <PrivateRoute>
                  <RegisterActivity />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/activities/:id" 
              element={
                <PrivateRoute>
                  <ActivityHistory />
                </PrivateRoute>
              } 
            />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;