import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Help from './pages/Help';
import OAuthCallback from './pages/OAuthCallback';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import VideoMeetComponent from './pages/VideoMeet';
import Authentication from './pages/authentication';
import History from './pages/history';
import HomeComponent from './pages/home';
import LandingPage from './pages/landing';

  function App() {
    return (
      <div className="App">

        <Router>

          <AuthProvider>


            <Routes>

              <Route path='/' element={<LandingPage />} />

              <Route path='/help' element={<Help />} />

              <Route path='/terms' element={<Terms />} />

              <Route path='/privacy' element={<Privacy />} />

              <Route path='/auth' element={<Authentication />} />

              <Route path="/auth/callback" element={<OAuthCallback />} />

              <Route path='/home' element={<HomeComponent />} />

              <Route path='/history' element={<History />} />

              <Route path='/:url' element={<VideoMeetComponent />} />

            </Routes>
          </AuthProvider>

        </Router>
      </div>
    );
  }

  export default App;
