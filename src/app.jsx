import AuthPage from './features/auth/components/AuthPage'
import ProjectPage from './features/projectspage/projectPage'
import { Navigate, Route, Routes } from 'react-router-dom'


function App() {


  return (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/projects/:userId" element={<ProjectPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
   
    
  )
}

export default App
