import React from 'react';
import { API_BASE_URL } from '../apiConfig';

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

interface User {
  id_pers: number;
  name: string;
  firstname: string;
}

interface AdminManageTeamsProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  users: User[];
  selectedManagerIds: { [teamId: number]: number | null };
  setSelectedManagerIds: React.Dispatch<React.SetStateAction<{ [teamId: number]: number | null }>>;
  newTeamName: string;
  setNewTeamName: React.Dispatch<React.SetStateAction<string>>;
}

const AdminManageTeams: React.FC<AdminManageTeamsProps> = ({
  teams,
  setTeams,
  users,
  selectedManagerIds,
  setSelectedManagerIds,
  newTeamName,
  setNewTeamName
}) => {

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

  return (
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
                            <button className="common-add-button" onClick={() => handleDeleteManager(manager.id_pers, manager.id_team, manager.name, manager.firstname)}>Remove</button>
                          </div>
                        ))
                    ) : (
                      'No managers'
                    )}
                    <div className="manager-container">
                    {/* Select pour ajouter un manager */}
                    <select
                      value={selectedManagerIds[team.id_team] ?? ''}
                      onChange={(e) =>
                        setSelectedManagerIds(prevState => ({
                          ...prevState,
                          [team.id_team]: e.target.value ? Number(e.target.value) : null
                        }))
                      }
                    >
                      <option value="">Select a manager</option>
                      {[...users]  // copie du tableau
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
  );
};

export default AdminManageTeams;
