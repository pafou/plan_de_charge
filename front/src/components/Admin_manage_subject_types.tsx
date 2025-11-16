import React from 'react';
import { API_BASE_URL } from '../apiConfig';

interface AdminManageSubjectTypesProps {
  subjectTypes: { [id: number]: string };
  setSubjectTypes: React.Dispatch<React.SetStateAction<{ [id: number]: string }>>;
  newSubjectType: string;
  setNewSubjectType: React.Dispatch<React.SetStateAction<string>>;
}

const AdminManageSubjectTypes: React.FC<AdminManageSubjectTypesProps> = ({
  subjectTypes,
  setSubjectTypes,
  newSubjectType,
  setNewSubjectType
}) => {

  return (
    <div className="subject-types-section">
      <h2>Subject Types</h2>
      <div className="subject-types-content">
        <div className="subject-types-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subjectTypes).map(([id, type]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newType = e.currentTarget.textContent;
                      if (newType !== type) {
                        const token = localStorage.getItem('jwtToken');
                        if (token) {
                          fetch(`${API_BASE_URL}/api/subject-types/${id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ type: newType }),
                          })
                            .then(response => {
                              if (response.ok) {
                                // Update the subject type in the state
                                setSubjectTypes(prevTypes => ({
                                  ...prevTypes,
                                  [id]: newType,
                                }));
                              } else {
                                // No alert for error
                              }
                            })
                            .catch(error => {
                              console.error('Error updating subject type:', error);
                              // No alert for error
                            });
                        }
                      }
                    }}
                  >
                    {type}
                  </td>
                  <td>
                    <button
                      className="common-add-button"
                      onClick={() => {
                        const isConfirmed = window.confirm(`Are you sure you want to delete the subject type "${type}"?`);
                        if (isConfirmed) {
                          const token = localStorage.getItem('jwtToken');
                          if (token) {
                            fetch(`${API_BASE_URL}/api/subject-types/${id}`, {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            })
                              .then(response => {
                                if (response.ok) {
                                  // Update the subject types in the state
                                  setSubjectTypes(prevTypes => {
                                    const newTypes = { ...prevTypes };
                                    delete newTypes[id as unknown as keyof typeof newTypes];
                                    return newTypes;
                                  });
                                } else {
                                  // No alert for error
                                }
                              })
                              .catch(error => {
                                console.error('Error deleting subject type:', error);
                                // No alert for error
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
        <div className="subject-types-add">
          <input
            type="text"
            placeholder="Type"
            value={newSubjectType}
            onChange={(e) => setNewSubjectType(e.target.value)}
          />
          <button
            onClick={() => {
              if (newSubjectType) {
                const token = localStorage.getItem('jwtToken');
                if (token) {
                  fetch(`${API_BASE_URL}/api/subject-types`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ type: newSubjectType }),
                  })
                    .then(response => {
                      if (response.ok) {
                        // Fetch the updated list of subject types
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
                            setNewSubjectType('');
                          })
                          .catch(error => {
                            console.error('Error fetching subject types:', error);
                          });
                      } else {
                        // No alert for error
                      }
                    })
                    .catch(error => {
                      console.error('Error adding subject type:', error);
                      // No alert for error
                    });
                }
              } else {
                alert('Please fill in all required fields.');
              }
            }}
            disabled={!newSubjectType}
          >
            Add Type
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManageSubjectTypes;
