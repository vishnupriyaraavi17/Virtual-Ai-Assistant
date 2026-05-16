import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import Customize2 from "./pages/Customize2";

import { userDataContext } from './context/userContext'
import Home from './pages/Home'

function App(){
  const { userData } = useContext(userDataContext)

  return (
    <Routes>
      {/* Home - only if assistant is customized */}
      <Route 
        path='/' 
        element={
          (userData?.assistantImage && userData?.assistantName) 
            ? <Home/> 
            : <Navigate to="/customize" />
        } 
      />

      {/* Signup - redirect to customize if logged in */}
      <Route 
        path='/signup' 
        element={
          !userData 
            ? <SignUp/> 
            : <Navigate to="/"/>
        } 
      />

      {/* Signin - redirect to customize if logged in */}
      <Route 
        path='/signin' 
        element={
          !userData 
            ? <SignIn/> 
            : <Navigate to="/" />
        } 
      />

      {/* Customize - redirect to signin if not logged in */}
      <Route 
        path='/customize' 
        element={
          userData 
            ? <Customize/> 
            : <Navigate to="/signup" />
        } 
      />
      <Route 
        path='/customize2' 
        element={
          userData 
            ? <Customize2/> 
            : <Navigate to="/signup" />
        } 
      />
    </Routes>
  )
}

export default App


