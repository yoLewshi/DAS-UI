import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Menubar from './shared_components/menubar';
import Toast from './shared_components/toast';
import { GlobalProvider } from './shared_components/globalContext';

import './App.css'

import PrivateRoute from './routes/privateRoute';

const Home = lazy(() => import('./routes/home'));
const Login = lazy(() => import('./routes/login'));

function App() {
  const page ="/";
 
  return (
    <GlobalProvider>
      <Menubar page={page}/>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute component={Home}/>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toast />
    </GlobalProvider>
  )
}

export default App
