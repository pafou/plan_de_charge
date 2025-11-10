import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';

interface DataItem {
  ID_pers: number;
  name: string;
  firstname: string;
  subject: string;
  comment?: string;
  month: string;
  load: number;
}

function Show() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Show Page</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Firstname</th>
            <th>Subject</th>
            <th>Comment</th>
            <th>Month</th>
            <th>Load</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={`${item.ID_pers}-${item.month}`}>
              <td>{item.ID_pers}</td>
              <td>{item.name}</td>
              <td>{item.firstname}</td>
              <td>{item.subject}</td>
              <td>{item.comment || 'No comment'}</td>
              <td>{new Date(item.month).toLocaleDateString()}</td>
              <td>{item.load}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Show;
