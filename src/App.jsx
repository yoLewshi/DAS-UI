import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Menubar from './shared_components/menubar';
import Toast from './shared_components/toast';
import { GlobalProvider } from './shared_components/globalContext';

import './App.css'

import PrivateRoute from './routes/privateRoute';

const CruiseConfig = lazy(() => import('./routes/cruise_config'));
const Home = lazy(() => import('./routes/home'));
const Login = lazy(() => import('./routes/login'));
const LoggerConfig = lazy(() => import('./routes/logger_config'));
const EditYaml = lazy(() => import('./routes/edit_yaml'));
const Grafana = lazy(() => import('./routes/grafana'));
const OpenRVDAS = lazy(() => import('./routes/openrvdas'));

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
            <Route path="/logger/config/:loggerName" element={<LoggerConfig />} />
            <Route path="/cruise/config/" element={<CruiseConfig />} />
            <Route path="/edit_yaml" element={<EditYaml />} />
            <Route path="/native" element={<OpenRVDAS />} />
            <Route path="/grafana" element={<Grafana />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toast />
    </GlobalProvider>
  )
}

export default App
