import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Menubar from './shared_components/menubar';
import Toast from './shared_components/toast';
import { GlobalProvider } from './shared_components/globalContext';


import './App.css'
import { getAPI } from './shared_methods/api';

const Home = lazy(() => import('./routes/home'));
const Login = lazy(() => import('./routes/login'));

function App() {
  
  const [globalProps, setGlobalProps] = useState({"permissions": {}});
  const page ="/";

  function getAuthDetails() {
    getAPI("/get-auth-user").then((response) => {

      const updatedProps = Object.assign({}, globalProps, {username: response.user.username, permissions: response.user.user_permissions})

      setGlobalProps(updatedProps);
    })
  }

  useEffect(getAuthDetails, []);
  
  return (
    <GlobalProvider global={globalProps}>
      <Menubar page={page}/>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toast />
    </GlobalProvider>
  )
}

export default App
