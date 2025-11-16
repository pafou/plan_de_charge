import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import './Admin.css';

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

interface Team {
  id_team: number;
  team: string;
  managers?: TeamManager[];
}

interface TeamManager {
  id_pers: number;
  name: string;
  firstname: string;
  id_team: number;
}

interface TeamMember {
  id_pers: number;
  name: string;
  firstname: string;
  id_team: number;
}

function Admin() {
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const navigate = useNavigate();

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
              setAdmins(admins.filter(admin => admin.id_pers !== id));
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedManagerIds, setSelectedManagerIds] = useState<{ [teamId: number]: number | null }>({});
  const [allTeamManagers, setAllTeamManagers] = useState<TeamManager[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberFirstname, setNewMemberFirstname] = useState('');
  const [newMemberId, setNewMemberId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

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

      // Fetch the list of teams with their managers
      fetch(`${API_BASE_URL}/api/teams-with-managers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(teamData => {
          const updatedTeams = teamData.reduce((acc: any, team: any) => {
            const existingTeam = acc.find((t: any) => t.id_team === team.id_team);
            if (existingTeam) {
              if (team.manager_id) {
                existingTeam.managers.push({
                  id_pers: team.manager_id,
                  name: team.manager_name,
                  firstname: team.manager_firstname,
                  id_team: team.id_team,
                });
              }
            } else {
              acc.push({
                id_team: team.id_team,
                team: team.team,
                managers: team.manager_id ? [
                  {
                    id_pers: team.manager_id,
                    name: team.manager_name,
                    firstname: team.manager_firstname,
                    id_team: team.id_team,
                  },
                ] : [],
              });
            }
            return acc;
          }, []);
          setTeams(updatedTeams);
        })
        .catch(error => {
          console.error('Error fetching teams with managers:', error);
        });

      // Fetch the list of team members
      fetch(`${API_BASE_URL}/api/team-members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(memberData => {
          setTeamMembers(memberData);
        })
        .catch(error => {
          console.error('Error fetching team members:', error);
        });
    }
  }, [admins]);

  const handleDeleteTeam = (id: number, teamName: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the team "${teamName}"?`);
    if (isConfirmed) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        fetch(`${API_BASE_URL}/api/teams/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(response => {
            if (response.ok) {
              setTeams(teams.filter(team => team.id_team !== id));
            } else {
              // No alert for error
            }
          })
          .catch(error => {
            console.error('Error deleting team:', error);
            // No alert for error
          });
      }
    }
  };

  const handleDeleteManager = (managerId: number, teamId: number, managerName: string, managerFirstname: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${managerFirstname} ${managerName} from the team?`);
    if (isConfirmed) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        fetch(`${API_BASE_URL}/api/teams/${teamId}/managers/${managerId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(response => {
            if (response.ok) {
              // Update the state to remove the manager from the team
              setTeams(prevTeams =>
                prevTeams.map(team =>
                  team.id_team === teamId
                    ? {
                        ...team,
                        managers: team.managers?.filter(manager => manager.id_pers !== managerId) || [],
                      }
                    : team
                )
              );
            } else {
              // No alert for error
            }
          })
          .catch(error => {
            console.error('Error removing manager:', error);
            // No alert for error
          });
      }
    }
  };

  const handleAddManager = (teamId: number, managerId: number) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      fetch(`${API_BASE_URL}/api/teams/${teamId}/managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ managerId }),
      })
        .then(response => {
          if (response.ok) {
            // Update the state to add the manager to the team
            setTeams(prevTeams =>
              prevTeams.map(team =>
                team.id_team === teamId
                  ? {
                      ...team,
                      managers: [
                        ...(team.managers || []),
                        {
                          id_pers: managerId,
                          name: users.find(user => user.id_pers === managerId)?.name || '',
                          firstname: users.find(user => user.id_pers === managerId)?.firstname || '',
                          id_team: teamId,
                        },
                      ],
                    }
                  : team
              )
            );
            // Reset the selected manager for this team
            setSelectedManagerIds(prevState => ({
              ...prevState,
              [teamId]: null
            }));

            // Refresh the page after adding a manager
            window.location.reload();
          } else {
            // No alert for error
          }
        })
        .catch(error => {
          console.error('Error adding manager:', error);
          // No alert for error
        });
    }
  };

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
    <div>
      <h1>Admin Page - User: {userId}</h1>
      <p>Welcome to the admin section. Here you can manage users, settings, and more.</p>

      <div className="admin-container">
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
                          <button className="manager-delete-button" onClick={() => handleDelete(admin.id_pers, admin.name, admin.firstname)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="admin-add">
              <select
                value={selectedUserId !== null ? selectedUserId : ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="">Select a user</option>
                {users
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

        <div className="teams-section">
          <h2>Teams</h2>
          <div className="teams-content">
            <div className="teams-list">
              <table>
                <thead>
                <tr>
                  <th>Team ID</th>
                  <th>Team Name</th>
                  <th>Managers</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                  {teams
                    .sort((a, b) => a.team.localeCompare(b.team))
                    .map(team => (
                      <tr key={team.id_team}>
                        <td>{team.id_team}</td>
                        <td>{team.team}</td>
                        <td>
                        {team.managers && team.managers.length > 0 ? (
                          team.managers
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((manager: TeamManager) => (
                              <div key={manager.id_pers} className="manager-container">
                                <span>{manager.name} {manager.firstname} (ID: {manager.id_pers})</span>
                                <button className="manager-delete-button" onClick={() => handleDeleteManager(manager.id_pers, manager.id_team, manager.name, manager.firstname)}>Remove</button>
                              </div>
                            ))
                        ) : (
                          'No managers'
                        )}
                        <div className="manager-container">
                        <select
                          value={selectedManagerIds[team.id_team] ?? ''}
                          onChange={(e) => setSelectedManagerIds(prevState => ({
                            ...prevState,
                            [team.id_team]: e.target.value ? Number(e.target.value) : null
                          }))}
                        >
                          <option value="">Select a manager</option>
                          {users
                            .filter(user => !team.managers?.some(manager => manager.id_pers === user.id_pers))
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(user => (
                              <option key={user.id_pers} value={user.id_pers}>
                                {user.name} {user.firstname} (ID: {user.id_pers})
                              </option>
                            ))}
                        </select>
                        <button
                          className="manager-add-button"
                          onClick={() => {
                            const managerId = selectedManagerIds[team.id_team];
                            if (managerId !== null && managerId !== undefined) {
                              handleAddManager(team.id_team, managerId);
                            }
                          }}
                          disabled={selectedManagerIds[team.id_team] === null || selectedManagerIds[team.id_team] === undefined}
                        >
                          Add Manager
                        </button>
                        </div>
                        </td>
                        <td>
                          <button className="manager-delete-button" onClick={() => handleDeleteTeam(team.id_team, team.team)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="teams-add">
              <input
                type="text"
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <button
                onClick={() => {
                  const token = localStorage.getItem('jwtToken');
                  if (token && newTeamName) {
                    fetch(`${API_BASE_URL}/api/teams`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ team: newTeamName }),
                    })
                      .then(response => {
                        if (response.ok) {
                          // Refresh the page after adding a team
                          window.location.reload();
                        } else {
                          alert('Error adding team');
                        }
                      })
                      .catch(error => {
                        console.error('Error adding team:', error);
                        alert('Error adding team');
                      });
                  }
                }}
                disabled={!newTeamName}
              >
                Add Team
              </button>
            </div>
          </div>
        </div>

        <div className="team-members-section">
          <h2>Team Members</h2>
          <div className="team-members-content">
            <div className="team-members-list">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Firstname</th>
                    <th>Team</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
{teamMembers
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(member => (
    <tr key={member.id_pers}>
      <td>{member.id_pers}</td>
      <td>{member.name}</td>
      <td>{member.firstname}</td>
      <td>
        <select
          value={member.id_team}
          onChange={(e) => {
            const token = localStorage.getItem('jwtToken');
            if (token) {
              fetch(`${API_BASE_URL}/api/team-members/update`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id_pers: member.id_pers, id_team: Number(e.target.value) }),
              })
                .then(response => {
                  if (response.ok) {
                    // Update the state with the new team ID
                    setTeamMembers(prevMembers =>
                      prevMembers.map(m =>
                        m.id_pers === member.id_pers
                          ? { ...m, id_team: Number(e.target.value) }
                          : m
                      )
                    );
                  } else {
                    alert('Error updating team');
                  }
                })
                .catch(error => {
                  console.error('Error updating team:', error);
                  alert('Error updating team');
                });
            }
          }}
        >
          {teams.map(team => (
            <option key={team.id_team} value={team.id_team}>
              {team.team}
            </option>
          ))}
        </select>
      </td>
      <td>
        <button
          className="manager-delete-button"
          onClick={() => {
            const isConfirmed = window.confirm(`Are you sure you want to remove ${member.firstname} ${member.name} from the team?`);
            if (isConfirmed) {
              const token = localStorage.getItem('jwtToken');
              if (token) {
                fetch(`${API_BASE_URL}/api/team-members/${member.id_pers}`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                  .then(response => {
                    if (response.ok) {
                      setTeamMembers(teamMembers.filter(m => m.id_pers !== member.id_pers));
                    } else {
                      alert('Error removing member');
                    }
                  })
                  .catch(error => {
                    console.error('Error removing member:', error);
                    alert('Error removing member');
                  });
              }
            }
          }}
        >
          Remove
        </button>
      </td>
    </tr>
  ))}
                </tbody>
              </table>
            </div>
<div className="team-members-add">
<input
  type="text"
  placeholder="Name"
  value={newMemberName}
  onChange={(e) => setNewMemberName(e.target.value)}
/>
<input
  type="text"
  placeholder="Firstname"
  value={newMemberFirstname}
  onChange={(e) => setNewMemberFirstname(e.target.value)}
/>
<input
  type="number"
  placeholder="ID"
  value={newMemberId !== null ? newMemberId : ''}
  onChange={(e) => setNewMemberId(e.target.value ? Number(e.target.value) : null)}
/>
<select
  value={selectedTeamId !== null ? selectedTeamId : ''}
  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
>
  <option value="">Select a team</option>
  {teams.map(team => (
    <option key={team.id_team} value={team.id_team}>
      {team.team}
    </option>
  ))}
</select>
<button
  onClick={() => {
    const token = localStorage.getItem('jwtToken');
    if (token && newMemberName && newMemberFirstname && newMemberId !== null && selectedTeamId !== null) {
      fetch(`${API_BASE_URL}/api/team-members/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_pers: newMemberId,
          name: newMemberName,
          firstname: newMemberFirstname,
          id_team: selectedTeamId,
        }),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then(errorData => {
              let errorMessage = 'Error adding member';
              if (errorData && errorData.message) {
                errorMessage += `: ${errorData.message}`;
              }
              alert(errorMessage);
              throw new Error(errorMessage);
            });
          }
        })
        .then(data => {
          // Refresh the page after adding a member
          window.location.reload();
        })
        .catch(error => {
          console.error('Error adding member:', error);
          alert('Error adding member: ' + error.message);
        });
    } else {
      alert('Please fill in all required fields.');
    }
  }}
  disabled={!newMemberName || !newMemberFirstname || newMemberId === null || selectedTeamId === null}
>
  Add Member
</button>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
