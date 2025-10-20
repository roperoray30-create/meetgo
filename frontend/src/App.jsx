import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MeetingScheduler from './pages/MeetingScheduler';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<MeetingScheduler />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;