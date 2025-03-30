import Hero from '../components/Hero';

function Home() {
  return (
    <div>
      <Hero />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">
            Process your documents intelligently with our AI-powered tools
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Document Chat</h3>
            <p className="text-gray-600 mb-4">
              Engage in interactive conversations about your documents. Ask questions
              and get intelligent answers based on your content.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Quiz Generation</h3>
            <p className="text-gray-600 mb-4">
              Test your understanding with automatically generated quizzes. Perfect
              for learning and revision.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Smart Embeddings</h3>
            <p className="text-gray-600 mb-4">
              Explore semantic relationships in your text with our advanced
              embedding technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;