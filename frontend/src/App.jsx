import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import UploadDocument from './pages/UploadDocument';
import KnowledgeSearch from './pages/KnowledgeSearch';
import AIAssistant from './pages/AIAssistant';
import DocumentDetails from './pages/DocumentDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id" element={<DocumentDetails />} />
        <Route path="/upload" element={<UploadDocument />} />
        <Route path="/search" element={<KnowledgeSearch />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
