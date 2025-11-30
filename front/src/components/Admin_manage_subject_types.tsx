import React from 'react';
import { API_BASE_URL } from '../apiConfig';

interface AdminManageSubjectTypesProps {
  subjectTypes: { [id: number]: string };
  setSubjectTypes: React.Dispatch<React.SetStateAction<{ [id: number]: string }>>;
  newSubjectType: string;
  setNewSubjectType: React.Dispatch<React.SetStateAction<string>>;
  subjectTypeColors: { [id: number]: string };
  setSubjectTypeColors: React.Dispatch<React.SetStateAction<{ [id: number]: string }>>;
}

const AdminManageSubjectTypes: React.FC<AdminManageSubjectTypesProps> = ({
  subjectTypes,
  setSubjectTypes,
  newSubjectType,
  setNewSubjectType,
  subjectTypeColors,
  setSubjectTypeColors
}) => {
  const [newSubjectColor, setNewSubjectColor] = React.useState('#000000');

  return (
    <div className="admin-section">
      <h2>Subject Types</h2>
      <div className="admin-content">
        <div className="admin-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subjectTypes).map(([id, type]) => {
                const numericId = parseInt(id, 10);
                return (
                  <tr key={numericId}>
                    <td>{numericId}</td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newType = e.currentTarget.textContent as string;
                        if (newType !== type) {
                          const token = localStorage.getItem('jwtToken');
                          if (token) {
                            fetch(`${API_BASE_URL}/api/subject-types/${numericId}`, {
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
                                  setSubjectTypes(prevTypes => {
                                    const newTypes = { ...prevTypes };
                                    newTypes[numericId] = newType;
                                    return newTypes;
                                  });
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
                    <td style={{ backgroundColor: subjectTypeColors[numericId] }}>
                      <input
                        type="color"
                        value={subjectTypeColors[numericId]}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          if (newColor !== subjectTypeColors[numericId]) {
                            const token = localStorage.getItem('jwtToken');
                            if (token) {
                              fetch(`${API_BASE_URL}/api/subject-types/${numericId}/color`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ color: newColor }),
                              })
                                .then(response => {
                                  if (response.ok) {
                                    // Update the color in the state
                                    setSubjectTypeColors(prevColors => {
                                      const newColors = { ...prevColors };
                                      newColors[numericId] = newColor;
                                      return newColors;
                                    });
                                  } else {
                                    // No alert for error
                                  }
                                })
                                .catch(error => {
                                  console.error('Error updating subject type color:', error);
                                  // No alert for error
                                });
                            }
                          }
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="admin-add-button"
                        onClick={() => {
                          const isConfirmed = window.confirm(`Are you sure you want to delete the subject type "${type}"?`);
                          if (isConfirmed) {
                            const token = localStorage.getItem('jwtToken');
                            if (token) {
                              fetch(`${API_BASE_URL}/api/subject-types/${numericId}`, {
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
                                      delete newTypes[numericId as unknown as keyof typeof newTypes];
                                      return newTypes;
                                    });
                                    // Also update the subject type colors in the state
                                    setSubjectTypeColors(prevColors => {
                                      const newColors = { ...prevColors };
                                      delete newColors[numericId as unknown as keyof typeof newColors];
                                      return newColors;
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
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-add">
          <h3>Add a new subject type</h3>
          <input
            type="text"
            placeholder="Type"
            value={newSubjectType}
            onChange={(e) => setNewSubjectType(e.target.value)}
          />
          <input
            type="color"
            value={newSubjectColor}
            onChange={(e) => setNewSubjectColor(e.target.value)}
          />
          <button
            onClick={() => {
              if (newSubjectType && newSubjectColor) {
                const token = localStorage.getItem('jwtToken');
                if (token) {
                  fetch(`${API_BASE_URL}/api/subject-types`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ type: newSubjectType, color: newSubjectColor }),
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

                            // Also fetch the updated list of subject type colors
                            const colorsMap = typeData.reduce((acc: { [id: number]: string }, type: any) => {
                              acc[type.id_subject_type] = type.color_hex;
                              return acc;
                            }, {});
                            setSubjectTypeColors(colorsMap);

                            setNewSubjectType('');
                            setNewSubjectColor('#000000'); // Reset to default color
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
            disabled={!newSubjectType || !newSubjectColor}
          >
            Add Type
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManageSubjectTypes;
