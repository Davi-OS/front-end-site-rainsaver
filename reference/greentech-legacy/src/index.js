// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';  // Atualize esta linha para importar createRoot
import './styles/App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));  // Crie a raiz usando createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
