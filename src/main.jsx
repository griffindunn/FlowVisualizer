// src/main.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import MainFlow from './MainFlow';

// Basic File Uploader Wrapper
const App = () => {
  const [jsonContent, setJsonContent] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setJsonContent(json);
      } catch (error) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  if (jsonContent) {
    return <MainFlow fileContent={jsonContent} />;
  }

  return (
    <div style={{ 
      height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', 
      background: '#f5f5f5', gap: '20px', fontFamily: 'sans-serif' 
    }}>
      <h1 style={{color: '#333'}}>WxCC Flow Visualizer</h1>
      <div style={{
        padding: '40px', background: 'white', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center'
      }}>
        <p style={{marginBottom: '20px', color: '#666'}}>Upload your <code>webex_flow.json</code> file to begin</p>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
