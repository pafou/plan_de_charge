import React, { useEffect, useState } from 'react';

function Admin() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.userId);
      document.title = `Admin - User: ${decodedToken.userId}`;
    } else {
      document.title = 'Admin';
    }
  }, []);

  return (
    <div>
      <h1>Admin Page - User: {userId}</h1>
      <p>Welcome to the admin section. Here you can manage users, settings, and more.</p>
    </div>
  );
}

export default Admin;
