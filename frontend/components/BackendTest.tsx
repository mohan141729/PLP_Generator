import React, { useEffect, useState } from 'react';
import { testService } from '../services/api';

const BackendTest: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await testService.testConnection();
        setMessage(response.data.message);
        setError('');
      } catch (err) {
        setError('Failed to connect to backend');
        setMessage('');
      }
    };

    testBackendConnection();
  }, []);

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #ccc' }}>
      <h2>Backend Connection Test</h2>
      {message && (
        <div style={{ color: 'green', margin: '10px 0' }}>
          Success: {message}
        </div>
      )}
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default BackendTest; 