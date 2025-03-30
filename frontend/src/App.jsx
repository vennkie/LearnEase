import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DocumentProvider } from './context/DocumentContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import Summary from './pages/Summary';
import Upload from './pages/Upload';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/summary" element={<Summary />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </DocumentProvider>
  );
}

export default App