import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import './Admin.css';
import AdminManageAdmin from './Admin_manage_admin';
import AdminManageTeams from './Admin_manage_teams';
import AdminManageTeamMembers from './Admin_manage_team_members';
import AdminManageSubjects from './Admin_manage_subjects';
import AdminManageSubjectTypes from './Admin_manage_subject_types';
import AdminManageColors from './Admin_manage_colors';

interface AdminUser {
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

interface Subject {
  id_subject: number;
  subject: string;
  id_subject_type: number;
  type?: string;
}

function Admin() {
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectTypes, setSubjectTypes] = useState<{ [id: number]: string }>({});
  const [subjectTypeColors, setSubjectTypeColors] = useState<{ [id: number]: string }>({}); // Add this line
  const [selectedSubjectType, setSelectedSubjectType] = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newSubjectType, setNewSubjectType] = useState('');
  const [colorMapping, setColorMapping] = useState<{ id_map: number; color_hex: string }[]>([]);
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedManagerIds, setSelectedManagerIds] = useState<{ [teamId: number]: number | null }>({});
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
const [newMemberName, setNewMemberName] = useState('');
const [newMemberFirstname, setNewMemberFirstname] = useState('');
const [newMemberId, setNewMemberId] = useState<number | null>(null);
const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
const [newTeamId, setNewTeamId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState('admin');

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.userId);
      document.title = `Admin`;

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

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      console.log('Fetching admins from:', `${API_BASE_URL}/api/admins`);
      // Fetch the list of admins first
      fetch(`${API_BASE_URL}/api/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          console.log('Response status:', response.status);
          console.log('Response headers:', response.headers);
          console.log('Response url:', response.url);
          console.log('Response type:', response.type);
          console.log('Response body:', response.body);
          return response.json();
        })
        .then((adminData: AdminUser[]) => {
          console.log('Admins data:', adminData);
          setAdmins(adminData);

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
                !adminData.some((admin: AdminUser) => admin.id_pers === person.id_pers)
              );
              setUsers(nonAdminUsers);
            })
            .catch(error => {
              console.error('Error fetching users:', error);
            });
        })
        .catch(error => {
          console.error('Error fetching admins:', error);
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

      // Fetch the list of subjects
      fetch(`${API_BASE_URL}/api/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(subjectData => {
          setSubjects(subjectData);
        })
        .catch(error => {
          console.error('Error fetching subjects:', error);
        });

      // Fetch the list of subject types
      fetch(`${API_BASE_URL}/api/subject-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(typeData => {
          const typesMap = typeData.reduce((acc: { [id: number]: string }, type: any) => {
            acc[type.id_subject_type] = type.type;
            return acc;
          }, {});
          setSubjectTypes(typesMap);

          // Also fetch the list of subject type colors
          const colorsMap = typeData.reduce((acc: { [id: number]: string }, type: any) => {
            acc[type.id_subject_type] = type.color_hex;
            return acc;
          }, {});
          setSubjectTypeColors(colorsMap);
        })
        .catch(error => {
          console.error('Error fetching subject types:', error);
        });
    }
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-container">
      <h1>Admin Page</h1>
      <p>Welcome to the admin section. Here you can manage users, settings, and more.</p>

      <div className="admin-tabs">
        <button
          className={activeTab === 'admin' ? 'active' : ''}
          onClick={() => setActiveTab('admin')}
        >
          Manage Admins
        </button>
        <button
          className={activeTab === 'teams' ? 'active' : ''}
          onClick={() => setActiveTab('teams')}
        >
          Manage Teams
        </button>
        <button
          className={activeTab === 'team-members' ? 'active' : ''}
          onClick={() => setActiveTab('team-members')}
        >
          Manage Team Members
        </button>
        <button
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          Manage Subjects
        </button>
        <button
          className={activeTab === 'subject-types' ? 'active' : ''}
          onClick={() => setActiveTab('subject-types')}
        >
          Manage Subject Types
        </button>
        <button
          className={activeTab === 'colors' ? 'active' : ''}
          onClick={() => setActiveTab('colors')}
        >
          Manage Colors
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'admin' && (
          <AdminManageAdmin
            userId={userId}
            admins={admins}
            setAdmins={setAdmins}
            users={users}
            setUsers={setUsers}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
          />
        )}
        {activeTab === 'teams' && (
          <AdminManageTeams
            teams={teams}
            setTeams={setTeams}
            selectedManagerIds={selectedManagerIds}
            setSelectedManagerIds={setSelectedManagerIds}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            newTeamId={newTeamId}
            setNewTeamId={setNewTeamId}
          />
        )}
        {activeTab === 'team-members' && (
          <AdminManageTeamMembers
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            teams={teams}
            newMemberName={newMemberName}
            setNewMemberName={setNewMemberName}
            newMemberFirstname={newMemberFirstname}
            setNewMemberFirstname={setNewMemberFirstname}
            newMemberId={newMemberId}
            setNewMemberId={setNewMemberId}
            selectedTeamId={selectedTeamId}
            setSelectedTeamId={setSelectedTeamId}
          />
        )}
        {activeTab === 'subjects' && (
          <AdminManageSubjects
            subjects={subjects}
            setSubjects={setSubjects}
            subjectTypes={subjectTypes}
            subjectTypeColors={subjectTypeColors}
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            selectedSubjectType={selectedSubjectType}
            setSelectedSubjectType={setSelectedSubjectType}
          />
        )}
        {activeTab === 'subject-types' && (
          <AdminManageSubjectTypes
            subjectTypes={subjectTypes}
            setSubjectTypes={setSubjectTypes}
            subjectTypeColors={subjectTypeColors} // Add this line
            setSubjectTypeColors={setSubjectTypeColors} // Add this line
            newSubjectType={newSubjectType}
            setNewSubjectType={setNewSubjectType}
          />
        )}
        {activeTab === 'colors' && (
          <AdminManageColors
            colorMapping={colorMapping}
            setColorMapping={setColorMapping}
          />
        )}
      </div>
    </div>
  );
}

export default Admin;
