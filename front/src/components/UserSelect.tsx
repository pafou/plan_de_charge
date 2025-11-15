import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';

interface User {
  ID_pers: number;
  name: string;
  firstname: string;
}

const UserSelect: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/persons`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value);
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <label htmlFor="user-select">Select User: </label>
      <select id="user-select" value={selectedUser} onChange={handleUserChange}>
        <option value="">--Please choose a user--</option>
        {users.map((user) => (
          <option key={user.ID_pers} value={`${user.name} ${user.firstname}`}>
            {user.name} {user.firstname}
          </option>
        ))}
      </select>
      {selectedUser && <p>Selected: {selectedUser}</p>}
    </div>
  );
};

export default UserSelect;
