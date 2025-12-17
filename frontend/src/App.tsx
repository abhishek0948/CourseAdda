import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
