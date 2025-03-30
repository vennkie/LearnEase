import { useState } from 'react';
import { getEmbeddings } from '../lib/api';
import Loading from '../components/Loading';
import Error from '../components/Error';

function Embeddings() {
  const [input, setInput] = useState('');
  const [embeddings, setEmbeddings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const sentences = input.split('\n').filter(s => s.trim());
      const result = await getEmbeddings(sentences);
      setEmbeddings(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sentence Embeddings</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded mb-4 h-32"
            placeholder="Enter sentences (one per line)..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            Generate Embeddings
          </button>
        </form>

        {loading && <Loading />}
        {error && <Error message={error} />}
        
        {embeddings && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4">Results</h2>
            <pre className="overflow-x-auto">
              {JSON.stringify(embeddings, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Embeddings;