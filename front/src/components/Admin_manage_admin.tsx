import React from 'react';
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

interface AdminManageAdminProps {
  userId: string;
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  selectedUserId: number | null;
  setSelectedUserId: React.Dispatch<React.SetStateAction<number | null>>;
}

const AdminManageAdmin: React.FC<AdminManageAdminProps> = ({
  userId,
  admins,
  setAdmins,
  users,
  setUsers,
  selectedUserId,
  setSelectedUserId
}) => {

  const handleDelete = (id: number, name: string, firstname: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${firstname} ${name}?`);
    if (isConfirmed) {
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
              setAdmins(admins.filter((admin: Admin) => admin.id_pers !== id));
              // Fetch the updated list of users
              fetch(`${API_BASE_URL}/api/persons`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(response => response.json())
                .then(userData => {
                  setUsers(userData);
                })
                .catch(error => {
                  console.error('Error fetching users:', error);
                });
            } else {
              // No alert for error
            }
          })
          .catch(error => {
            console.error('Error deleting admin:', error);
            // No alert for error
          });
      }
    }
  };

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
                  // Fetch the updated list of users
                  fetch(`${API_BASE_URL}/api/persons`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  })
                    .then(response => response.json())
                    .then(userData => {
                      setUsers(userData);
                      setSelectedUserId(null);
                    })
                    .catch(error => {
                      console.error('Error fetching users:', error);
                    });
                })
                .catch(error => {
                  console.error('Error fetching admins:', error);
                });
            } else {
              // No alert for error
            }
          })
          .catch(error => {
            console.error('Error adding user as admin:', error);
            // No alert for error
          });
      }
    }
  };

  return (
    <div className="admin-section">
      <h2>Admin</h2>
      <div className="admin-content">
        <div className="admin-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Firstname</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(admin => (
                  <tr key={admin.id_pers}>
                    <td>{admin.id_pers}</td>
                    <td>{admin.name}</td>
                    <td>{admin.firstname}</td>
                    <td>
                      <button className="admin-add-button" onClick={() => handleDelete(admin.id_pers, admin.name, admin.firstname)}>Remove</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="admin-add">
          {/* Select pour choisir un utilisateur */}
          <select
            value={selectedUserId !== null ? selectedUserId : ''}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
          >
            <option value="">Select a user</option>
            {[...users]
              .filter(user => !admins.some(admin => admin.id_pers === user.id_pers))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(user => (
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
    </div>
  );
};

export default AdminManageAdmin;
