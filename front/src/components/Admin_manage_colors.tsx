import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';

interface ColorMapping {
  id_map: number;
  color_hex: string;
}

interface AdminManageColorsProps {
  colorMapping: ColorMapping[];
  setColorMapping: React.Dispatch<React.SetStateAction<ColorMapping[]>>;
}

const AdminManageColors: React.FC<AdminManageColorsProps> = ({
  colorMapping,
  setColorMapping
}) => {
  const [newColor, setNewColor] = useState('#000000');
  const [newLoad, setNewLoad] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      fetch(`${API_BASE_URL}/api/color-mapping`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          setColorMapping(data);
        })
        .catch(error => {
          console.error('Error fetching color mapping:', error);
        });
    }
  }, [setColorMapping]);

  const handleColorChange = (id_map: number, newColor: string) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      fetch(`${API_BASE_URL}/api/color-mapping/${id_map}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color_hex: newColor }),
      })
        .then(response => {
          if (response.ok) {
            setColorMapping(prevMapping => {
              const newMapping = [...prevMapping];
              const index = newMapping.findIndex(m => m.id_map === id_map);
              if (index !== -1) {
                newMapping[index].color_hex = newColor;
              }
              return newMapping;
            });
          } else {
            // No alert for error
          }
        })
        .catch(error => {
          console.error('Error updating color:', error);
          // No alert for error
        });
    }
  };

  const handleAddColor = () => {
    if (newLoad !== null && newLoad >= 0) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        fetch(`${API_BASE_URL}/api/color-mapping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_map: newLoad, color_hex: newColor }),
        })
          .then(response => {
            if (response.ok) {
              // Fetch the updated color mapping
              fetch(`${API_BASE_URL}/api/color-mapping`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(response => response.json())
                .then(data => {
                  setColorMapping(data);
                  setNewLoad(null);
                  setNewColor('#000000');
                })
                .catch(error => {
                  console.error('Error fetching updated color mapping:', error);
                });
            } else {
              // No alert for error
            }
          })
          .catch(error => {
            console.error('Error adding color:', error);
            // No alert for error
          });
      }
    } else {
      alert('Please enter a valid load value.');
    }
  };

  return (
    <div className="color-mapping-section">
      <h2>Color Mapping</h2>
      <div className="color-mapping-content">
        <div className="color-mapping-list">
          <table>
            <thead>
              <tr>
                <th>Load</th>
                <th>Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colorMapping.map(mapping => (
                <tr key={mapping.id_map}>
                  <td>{mapping.id_map}</td>
                  <td style={{ backgroundColor: mapping.color_hex }}>
                    <input
                      type="color"
                      value={mapping.color_hex}
                      onChange={(e) => handleColorChange(mapping.id_map, e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="admin-add-button"
                      onClick={() => {
                        const isConfirmed = window.confirm(`Are you sure you want to delete the color mapping for load ${mapping.id_map}?`);
                        if (isConfirmed) {
                          const token = localStorage.getItem('jwtToken');
                          if (token) {
                            fetch(`${API_BASE_URL}/api/color-mapping/${mapping.id_map}`, {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            })
                              .then(response => {
                                if (response.ok) {
                                  setColorMapping(prevMapping => {
                                    return prevMapping.filter(m => m.id_map !== mapping.id_map);
                                  });
                                } else {
                                  // No alert for error
                                }
                              })
                              .catch(error => {
                                console.error('Error deleting color mapping:', error);
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
        <div className="color-mapping-add">
          <h3>Add a new color mapping</h3>
          <input
            type="number"
            placeholder="Load"
            value={newLoad !== null ? newLoad : ''}
            onChange={(e) => setNewLoad(e.target.value ? parseInt(e.target.value, 10) : null)}
            min="0"
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
          <button
            onClick={handleAddColor}
            disabled={newLoad === null || newLoad < 0}
          >
            Add Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManageColors;
