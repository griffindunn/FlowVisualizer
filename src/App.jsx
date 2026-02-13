import React, { useState } from 'react';
import MainFlow from './MainFlow';

function App() {
  const [jsonContent, setJsonContent] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setJsonContent(parsed);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  if (!jsonContent) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', gap: '20px' }}>
        <h1 style={{ color: '#333' }}>WxCC Flow Visualizer</h1>
        <div style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>Upload your webex_flow.json file to begin</p>
          <input type="file" accept=".json" onChange={handleFileUpload} />
        </div>
      </div>
    );
  }

  return <MainFlow fileContent={jsonContent} />;
}

export default App;
