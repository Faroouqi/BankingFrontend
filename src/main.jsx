import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './css/index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={(
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    )}
                />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
