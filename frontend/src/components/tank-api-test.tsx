// Test component to debug tank API calls
import { useEffect, useState } from 'react';
import { tankApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export function TankApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { auth } = useAuthStore();

  const testGetTanks = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== Testing GET /api/tanks ===');
      console.log('Auth state:', auth);
      const response = await tankApi.getAll();
      console.log('Response:', response);
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTank = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== Testing POST /api/tanks ===');
      console.log('Auth state:', auth);
      const response = await tankApi.create({
        spbu_id: 11,
        name: 'Test Tank From Frontend',
        fuel_type: 'Premium',
        capacity: 1500
      });
      console.log('Response:', response);
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Tank API Test</h2>
      <div>
        <button onClick={testGetTanks} disabled={loading}>
          {loading ? 'Loading...' : 'Test GET /api/tanks'}
        </button>
        <button onClick={testCreateTank} disabled={loading} style={{ marginLeft: '10px' }}>
          {loading ? 'Loading...' : 'Test POST /api/tanks'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h3>Error:</h3>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '10px' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}