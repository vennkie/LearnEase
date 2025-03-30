import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDocument } from '../context/DocumentContext';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasDocument, resetDocument } = useDocument();
  
  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-300' : 'text-white';
  };

  const handleReset = () => {
    resetDocument();
    navigate('/upload');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Learn Ease
        </Link>
        <div className="space-x-6">
          <Link to="/upload" className={`hover:text-blue-300 transition-colors ${isActive('/upload')}`}>
            Upload
          </Link>
          {hasDocument && (
            <>
              <Link to="/chat" className={`hover:text-blue-300 transition-colors ${isActive('/chat')}`}>
                Chat
              </Link>
              <Link to="/quiz" className={`hover:text-blue-300 transition-colors ${isActive('/quiz')}`}>
                Quiz
              </Link>
              <Link to="/summary" className={`hover:text-blue-300 transition-colors ${isActive('/summary')}`}>
                Summary
              </Link>
              <button
                onClick={handleReset}
                className="text-red-300 hover:text-red-400 transition-colors"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation