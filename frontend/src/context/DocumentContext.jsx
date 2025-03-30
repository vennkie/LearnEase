import { createContext, useContext, useState } from 'react';

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [hasDocument, setHasDocument] = useState(false);
  const [documentName, setDocumentName] = useState('');

  const uploadComplete = (fileName) => {
    setHasDocument(true);
    setDocumentName(fileName);
  };

  const resetDocument = () => {
    setHasDocument(false);
    setDocumentName('');
  };

  return (
    <DocumentContext.Provider value={{ 
      hasDocument, 
      documentName, 
      uploadComplete, 
      resetDocument 
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}