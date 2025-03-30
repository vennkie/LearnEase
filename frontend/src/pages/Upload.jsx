import Upload from '../components/Upload';

function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>
        <p className="text-gray-600 mb-8">
          Upload your documents (PDF, DOCX, or TXT) for processing. Once uploaded,
          you can chat about the content, generate quizzes, and explore embeddings.
        </p>
        <Upload />
      </div>
    </div>
  );
}

export default UploadPage;