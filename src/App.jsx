import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Menubar from './shared_components/menubar';
import Toast from './shared_components/toast';
import { GlobalProvider } from './shared_components/globalContext';


import './App.css'

const Home = lazy(() => import('./routes/home'));

function App() {
  
  const globalProps = {"permissions": {}};
  const page ="/";

  return (
    <GlobalProvider global={globalProps}>
      <Menubar page={page}/>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toast />
    </GlobalProvider>
  )
}

export default App
