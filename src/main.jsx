import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'


import './style/bootstrap/bootstrap.bundle.min.js';
import './style/bootstrap/bootstrap-icons.css';
import './style/bootstrap/bootstrap.min.css';
import './style/bootstrap/bootstrap-theme.css';
import './style/bootstrap/bootstrap-theme-dark.css';

import './style/feeder.module.css';
import './style/stripes.module.css';
import './style/globalStyles.module.css';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
