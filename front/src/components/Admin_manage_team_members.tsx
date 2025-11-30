import React from 'react';
import { API_BASE_URL } from '../apiConfig';

interface Team {
  id_team: number;
  team: string;
}

interface TeamMember {
  id_pers: number;
  name: string;
  firstname: string;
  id_team: number;
}

interface AdminManageTeamMembersProps {
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  teams: Team[];
  newMemberName: string;
  setNewMemberName: React.Dispatch<React.SetStateAction<string>>;
  newMemberFirstname: string;
  setNewMemberFirstname: React.Dispatch<React.SetStateAction<string>>;
  newMemberId: number | null;
  setNewMemberId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTeamId: number | null;
  setSelectedTeamId: React.Dispatch<React.SetStateAction<number | null>>;
}

const AdminManageTeamMembers: React.FC<AdminManageTeamMembersProps> = ({
  teamMembers,
  setTeamMembers,
  teams,
  newMemberName,
  setNewMemberName,
  newMemberFirstname,
  setNewMemberFirstname,
  newMemberId,
  setNewMemberId,
  selectedTeamId,
  setSelectedTeamId
}) => {

  return (
    <div className="admin-section">
      <h2>Team Members</h2>
      <div className="admin-content">
        <div className="admin-list">
{teams.map(team => {
  const teamMembersList = teamMembers
    .filter(member => member.id_team === team.id_team)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div key={team.id_team} className="team-table">
      <h3>{team.team}</h3>
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
          {teamMembersList.map(member => (
            <tr key={member.id_pers}>
              <td>{member.id_pers}</td>
              <td>{member.name}</td>
              <td>{member.firstname}</td>
              <td>
                <button
                  className="admin-add-button"
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
  );
})}
        </div>
<h3>Add a new member</h3>
<div className="admin-add">
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
          // Update the team members list with the new member
          setTeamMembers(prevMembers => [
            ...prevMembers,
            {
              id_pers: newMemberId!,
              name: newMemberName,
              firstname: newMemberFirstname,
              id_team: selectedTeamId!,
            },
          ]);

          // Reset the input fields
          setNewMemberName('');
          setNewMemberFirstname('');
          setNewMemberId(null);
          setSelectedTeamId(null);
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
  );
};

export default AdminManageTeamMembers;
