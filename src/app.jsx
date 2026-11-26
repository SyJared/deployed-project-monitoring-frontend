import AuthPage from './features/auth/components/AuthPage'
import ProjectPage from './features/projectspage/projectPage'
import InsideProject from './features/projectspage/insideProject/insideProject'
import Header from './features/header/header'
import RequireAuth from './jwt/requireAuth'
import { Navigate, Route, Routes } from 'react-router-dom'


function App() {


  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/projects/:userId" element={<RequireAuth><ProjectPage /></RequireAuth>} />
        <Route path="/projects/:userId/:projectId" element={<RequireAuth><InsideProject /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
   
    
  )
}

export default App