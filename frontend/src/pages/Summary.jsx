import { useState, useEffect } from 'react';
import { useDocument } from '../context/DocumentContext';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { getSummary } from '../lib/api';
import { Link } from 'react-router-dom';

function Summary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasDocument } = useDocument();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getSummary();
        setSummary(data.summary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hasDocument) {
      fetchSummary();
    }
  }, [hasDocument]);

  if (!hasDocument) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Document Uploaded</h2>
          <p className="text-gray-600">Please upload a document first to view its summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Document Summary</h1>
        
        {loading && <Loading />}
        {error && <Error message={error} />}
        
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="prose max-w-none">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-around mt-8">
          <Link to="/chat">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Chat Your Queries
            </button>
          </Link>
          <Link to="/quiz">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Test with Quiz
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Summary;
