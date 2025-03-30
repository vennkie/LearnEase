import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Learning Made Easy with Learn Ease
          </h1>
          <p className="text-xl mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Upload your study materials and let our AI help you understand them better through
            summaries, interactive chat, and knowledge testing.
          </p>
          <div className="space-x-4">
            <Link
              to="/upload"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Upload Document
            </Link>
            <Link
              to="/chat"
              className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-500 hover:border-purple-600 transition-colors"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;