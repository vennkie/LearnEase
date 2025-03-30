import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi';
import { useDocument } from '../context/DocumentContext';
import Loading from './Loading';
import Error from './Error';

function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { uploadComplete } = useDocument();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (['application/pdf', 'application/msword', 'text/plain'].includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF, DOCX, or TXT file');
        setFile(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      
      if (response.status === 201) {
        alert('No content extracted from the file, please upload another file');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        return console.error('No content extracted from the file');
      }


      uploadComplete(file.name);
      navigate('/summary');
    } catch (err) {
      setError(err.message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.docx,.txt"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-gray-600">
              {file ? file.name : 'Click to upload PDF, DOCX, or TXT'}
            </span>
          </label>
        </div>

        {file && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        )}

        {loading && <Loading />}
        {error && <Error message={error} />}
      </form>
    </div>
  );
}

export default Upload