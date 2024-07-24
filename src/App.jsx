import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Menubar from './shared_components/menubar';
import Toast from './shared_components/toast';
import { GlobalProvider } from './shared_components/globalContext';

import './App.css'

import PrivateRoute from './routes/privateRoute';
import Loader from './shared_components/loader';

const CruiseConfig = lazy(() => import('./routes/cruise_config'));
const Home = lazy(() => import('./routes/home'));
const Login = lazy(() => import('./routes/login'));
const LoggerConfig = lazy(() => import('./routes/logger_config'));
const LoggerEditPage = lazy(() => import('./routes/loggers'));
const EditYaml = lazy(() => import('./routes/edit_yaml'));
const Grafana = lazy(() => import('./routes/grafana'));
const OpenRVDAS = lazy(() => import('./routes/openrvdas'));
const CacheViewer = lazy(() => import('./routes/cache_viewer'));
const Shortcuts = lazy(() => import('./routes/shortcuts'));
const UDPManager = lazy(() => import('./routes/udp_manager'));

function App() { 
  return (
    <GlobalProvider>
      <Menubar/>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute component={Home}/>} />
            <Route path="/loggers" element={<LoggerEditPage />} />
            <Route path="/logger/config/:loggerName" element={<LoggerConfig />} />
            <Route path="/cruise/config" element={<CruiseConfig />} />
            <Route path="/edit_yaml" element={<EditYaml />} />
            <Route path="/grafana" element={<Grafana />} />
            <Route path="/native" element={<OpenRVDAS />} />
            <Route path="/udp" element={<UDPManager />} />
            <Route path="/admin/shortcuts" element={<Shortcuts />} />
            <Route path="/admin/view_cache/:field?" element={<CacheViewer />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toast />
    </GlobalProvider>
  )
}

export default App
