import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FolderProvider from "./context/FolderContext";
import TaskProvider from "./context/TaskContext";
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TaskProvider>
      <FolderProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FolderProvider>
    </TaskProvider>
  </StrictMode>,
)
