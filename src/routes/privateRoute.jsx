import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAuth } from '../shared_methods/api';

function PrivateRoute({ component: Component, ...rest }) {
  const isAuthenticated = hasAuth();

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;