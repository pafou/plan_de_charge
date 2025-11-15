import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';

interface Admin {
  id_pers: number;
  name: string;
  firstname: string;
}

interface User {
  id_pers: number;
  name: string;
  firstname: string;
}

function Admin() {
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const navigate = useNavigate();

  const handleDelete = (id: number) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      fetch(`${API_BASE_URL}/api/admins/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (response.ok) {
            setAdmins(admins.filter(admin => admin.id_pers !== id));
            alert('Admin deleted successfully');
          } else {
            alert('Error deleting admin');
          }
        })
        .catch(error => {
          console.error('Error deleting admin:', error);
          alert('Error deleting admin');
        });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.userId);
      document.title = `Admin - User: ${decodedToken.userId}`;

      // Check if the user is an admin
      fetch(`${API_BASE_URL}/api/is-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (!data.isAdmin) {
            navigate('/');
          } else {
            setIsAdmin(true);

            // Fetch the list of admins
            fetch(`${API_BASE_URL}/api/admins`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(response => response.json())
              .then(adminData => {
                setAdmins(adminData);
              })
              .catch(error => {
                console.error('Error fetching admins:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error checking admin status:', error);
          navigate('/');
        });
    } else {
      document.title = 'Admin';
      navigate('/');
    }
  }, [navigate]);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      // Fetch the list of users who are not admins
      fetch(`${API_BASE_URL}/api/persons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(personData => {
          // Filter out users who are already admins
          const nonAdminUsers = personData.filter((person: User) =>
            !admins.some(admin => admin.id_pers === person.id_pers)
          );
          setUsers(nonAdminUsers);
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
    }
  }, [admins]);

  if (!isAdmin) {
    return null;
  }

  const handleAddAdmin = () => {
    if (selectedUserId !== null) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        fetch(`${API_BASE_URL}/api/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_pers: selectedUserId }),
        })
          .then(response => {
            if (response.ok) {
              // Fetch the updated list of admins
              fetch(`${API_BASE_URL}/api/admins`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(response => response.json())
                .then(adminData => {
                  setAdmins(adminData);
                  setSelectedUserId(null);
                  alert('User added as admin successfully');
                })
                .catch(error => {
                  console.error('Error fetching admins:', error);
                });
            } else {
              alert('Error adding user as admin');
            }
          })
          .catch(error => {
            console.error('Error adding user as admin:', error);
            alert('Error adding user as admin');
          });
      }
    }
  };

  return (
    <div>
      <h1>Admin Page - User: {userId}</h1>
      <p>Welcome to the admin section. Here you can manage users, settings, and more.</p>

      <h2>List of Admins</h2>
      <center><table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Firstname</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(admin => (
            <tr key={admin.id_pers}>
              <td>{admin.id_pers}</td>
              <td>{admin.name}</td>
              <td>{admin.firstname}</td>
              <td>
                <button onClick={() => handleDelete(admin.id_pers)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </center>

      <h2>Add a New Admin</h2>
      <div>
        <select
          value={selectedUserId !== null ? selectedUserId : ''}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
        >
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id_pers} value={user.id_pers}>
              {user.name} {user.firstname} (ID: {user.id_pers})
            </option>
          ))}
        </select>
        <button onClick={handleAddAdmin} disabled={selectedUserId === null}>
          Add as Admin
        </button>
      </div>
    </div>
  );
}

export default Admin;
