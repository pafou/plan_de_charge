import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';
import './Modif.css';
import { dateToYYYYMM, YYYYMMtoYYYY_MM, YYYY_MMtoYYYYMM, rangeYYYYMM, YYYY_MMtoDate, YYYYMMtoDate } from '../utils/dateUtils';

interface DataItem {
  id_pers: number;
  id_subject: number;
  name: string;
  firstname: string;
  subject: string;
  type: string;
  comment?: string;
  month: string;
  load: number;
  team: string;
  color_hex?: string;
}

interface GroupedData {
  id_pers: number;
  id_subject: number;
  name: string;
  firstname: string;
  subject: string;
  type: string;
  comment: string;
  loads: { [key: string]: number };
  team: string;
  [key: string]: any;
}

function Modif() {
  const [data, setData] = useState<DataItem[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [months, setMonths] = useState<number>(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>({ key: 'name', direction: 'ascending' });
  const [nameFilter, setNameFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [minMonth, setMinMonth] = useState<number | null>(null);
  const [maxMonth, setMaxMonth] = useState<number | null>(null);
  const [userId, setUserId] = useState('');
  const [editing, setEditing] = useState<{ id_pers: number; id_subject: number; month: number } | null>(null);
  const [newLoad, setNewLoad] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ id_pers: number; id_subject: number } | null>(null);
  const [showAddLineForm, setShowAddLineForm] = useState(false);
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [colorMapping, setColorMapping] = useState<{ [key: string]: string }>({});

  // State variables for minDate and maxDate
const [minDate, setMinDate] = useState(() => new Date());
const [maxDate, setMaxDate] = useState(() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 18);
  return d;
});

useEffect(() => {
  // Quand minDate change, on met à jour minMonth
  setMinMonth(dateToYYYYMM(minDate));
}, [minDate]);

useEffect(() => {
  // Quand maxDate change, on met à jour maxMonth
  setMaxMonth(dateToYYYYMM(maxDate));
}, [maxDate]);


  useEffect(() => {
    // Fetch color mapping from API
    fetch(`${API_BASE_URL}/api/color-mapping`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((colorData: { id_map: number; color_hex: string }[]) => {
        const mapping: { [key: string]: string } = {};
        colorData.forEach(item => {
          mapping[item.id_map.toString()] = item.color_hex;
        });
        console.log('Fetched color mapping:', mapping);
        setColorMapping(mapping);
        // Test if color mapping is working
        console.log('Test color for load 10:', getBackgroundColor(10));
      })
      .catch((error) => {
        console.error('Error fetching color mapping:', error);
      });

    const token = localStorage.getItem('jwtToken');
    let userId = '';
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      userId = decodedToken.userId;
      document.title = `Modif - User: ${userId}`;
    } else {
      document.title = 'Modif';
    }

    // Fetch related persons
    fetch(`${API_BASE_URL}/api/related-persons?id_pers=${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((relatedPersons: { id_pers: number }[]) => {
        const relatedIds = relatedPersons.map(person => person.id_pers);

        // Fetch data
        fetch(`${API_BASE_URL}/api/data`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((data: DataItem[]) => {
            // Filter data to include only related persons
            const filteredData = data.filter(item => relatedIds.includes(item.id_pers));
            //console.log('Fetched data:', filteredData);
            setData(filteredData);
            processData(filteredData);
            setLoading(false);

            // Extract available subjects for the add line form
            const subjects = Array.from(new Set(filteredData.map(item => item.subject)));
            setAvailableSubjects(subjects as string[]);
          })
          .catch((error) => {
            setError(error.message);
            setLoading(false);
          });

// Use the existing relatedPersons data for the add line form
// Fetch related persons ONLY for Add Line
fetch(`${API_BASE_URL}/api/related-persons?id_pers=${userId}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((related: { id_pers: number }[]) => {
    const relatedIds = related.map(p => p.id_pers);

    return fetch(`${API_BASE_URL}/api/persons`)
      .then(res => res.json())
      .then((persons: { id_pers: number; name: string; firstname: string }[]) => {
        const filteredPersons = persons
          .filter(p => relatedIds.includes(p.id_pers))
          .map(p => `${p.name} ${p.firstname}`);

        setAvailableNames(filteredPersons);
      });
  })
  .catch((error) => {
    console.error('Error fetching persons:', error);
  });

        // Fetch list of all subjects for the add line form
        fetch(`${API_BASE_URL}/api/subjects`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((subjects: { id_subject: number; subject: string }[]) => {
            const subjectNames = subjects.map(subject => subject.subject);
            setAvailableSubjects(subjectNames);
          })
          .catch((error) => {
            console.error('Error fetching subjects:', error);
          });

        // Store userId in state
        setUserId(userId);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (showAddLineForm) {
      // Fetch list of all subjects for the add line form
      fetch(`${API_BASE_URL}/api/subjects`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((subjects: { id_subject: number; subject: string }[]) => {
          const subjectNames = subjects.map(subject => subject.subject);
          setAvailableSubjects(subjectNames);
        })
        .catch((error) => {
          console.error('Error fetching subjects:', error);
        });
    }
  }, [showAddLineForm]);

const generateSelectableMonths = (): number[] => {
  const today = new Date();
  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const endDate = new Date(today.getFullYear() + 2, today.getMonth(), 1);

  const startYYYYMM = dateToYYYYMM(startDate); // number
  const endYYYYMM = dateToYYYYMM(endDate);     // number

  return rangeYYYYMM(startYYYYMM, endYYYYMM);  // number[]
};
const [selectableMonths, setSelectableMonths] = useState<number[]>(generateSelectableMonths());

const generateMonthsBetweenDates = (startDate: Date, endDate: Date): number[] => {
  const startYYYYMM = dateToYYYYMM(startDate);
  const endYYYYMM = dateToYYYYMM(endDate);
  return rangeYYYYMM(startYYYYMM, endYYYYMM); // renvoie number[]
};


const processData = (data: DataItem[]) => {
  const grouped: { [key: string]: GroupedData } = {};

  const fullMonths = generateMonthsBetweenDates(minDate, maxDate);

  data.forEach((item) => {
    const key = `${item.name}-${item.firstname}-${item.subject}-${item.comment || 'No comment'}`;

    if (!grouped[key]) {
      grouped[key] = {
        id_pers: item.id_pers,
        id_subject: item.id_subject,
        name: item.name,
        firstname: item.firstname,
        subject: item.subject,
        type: item.type,
        comment: item.comment || 'No comment',
        loads: {},
        team: item.team || 'Unknown',
        color_hex: item.color_hex || '',
      };
    }

    grouped[key].loads[item.month] = item.load;
  });

  // Remplir les mois manquants avec 0
  Object.values(grouped).forEach((item) => {
    fullMonths.forEach((month) => {
      if (!(month in item.loads)) {
        item.loads[month] = 0;
      }
    });
  });

  setGroupedData(Object.values(grouped));
};

const handleAddLine = async () => {
  if (!selectedName || !selectedSubject || !userId) return;

  try {
    // 1. Trouver l'ID de la personne et du sujet
    const [personsRes, subjectsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/persons`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/subjects`).then(res => res.json()),
    ]);

    const person = personsRes.find((p: { name: string; firstname: string }) => {
      const [name, firstname] = selectedName.split(' ');
      return p.name === name && p.firstname === firstname;
    });

    const subject = subjectsRes.find((s: { subject: string }) => s.subject === selectedSubject);

    if (!person || !subject) {
      console.error('Personne ou sujet introuvable');
      return;
    }

    // 2. Ajouter la nouvelle ligne
    const response = await fetch(`${API_BASE_URL}/api/addNewLine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_pers: person.id_pers,
        id_subject: subject.id_subject,
      }),
    });

    if (!response.ok) throw new Error('Échec de l\'ajout');

    // 3. Rafraîchir les données filtrées
    const relatedRes = await fetch(`${API_BASE_URL}/api/related-persons?id_pers=${userId}`);
    const relatedPersons = await relatedRes.json();
    const relatedIds = relatedPersons.map((p: { id_pers: number }) => p.id_pers);

    const dataRes = await fetch(`${API_BASE_URL}/api/data`);
    const data = await dataRes.json();
    const filteredData = data.filter((item: DataItem) => relatedIds.includes(item.id_pers));

    setData(filteredData);
    processData(filteredData);

    // 4. Réinitialiser le formulaire
    setShowAddLineForm(false);
    setSelectedName('');
    setSelectedSubject('');

  } catch (error) {
    console.error('Erreur:', error);
  }
};

const requestSort = (key: string) => {
  let direction = 'ascending';
  if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
    direction = 'descending';
  }
  setSortConfig({ key, direction });
};

const filteredGroupedData = React.useMemo(() => {
  let filteredItems = [...groupedData];

  if (nameFilter) {
    filteredItems = filteredItems.filter(item =>
      item.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }

  if (subjectFilter) {
    filteredItems = filteredItems.filter(item =>
      item.subject.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  }

  if (teamFilter) {
    filteredItems = filteredItems.filter(item =>
      item.team.toLowerCase().includes(teamFilter.toLowerCase())
    );
  }

  if (typeFilter) {
    filteredItems = filteredItems.filter(item =>
      item.type.toLowerCase().includes(typeFilter.toLowerCase())
    );
  }

  return filteredItems;
}, [groupedData, nameFilter, subjectFilter, teamFilter, typeFilter]);

const sortedGroupedData = React.useMemo(() => {
  let sortableItems = [...filteredGroupedData];
  if (sortConfig !== null) {
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }
  return sortableItems;
}, [filteredGroupedData, sortConfig]);

const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;
  const numVal = value ? Number(value) : null;

  if (name === "minMonth") {
    setMinMonth(numVal);
    if (numVal !== null) {
      setMinDate(YYYYMMtoDate(numVal));
    }
  }

  if (name === "maxMonth") {
    setMaxMonth(numVal);
    if (numVal !== null) {
      setMaxDate(YYYYMMtoDate(numVal));
    }
  }
};

const getdisplayedMonths = () => {
  // selection of months that will be displayed, between minDate and maxDate
  return generateMonthsBetweenDates(minDate, maxDate);
};

const displayedMonths = getdisplayedMonths();

const getBackgroundColor = (load: number) => {
  const keys = Object.keys(colorMapping).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)) as string[];
  const values = keys.map(key => colorMapping[key]);

  if (load <= 0) return values[0];
  if (load >= 30) return values[values.length - 1];

  for (let i = 0; i < keys.length - 1; i++) {
    const key1 = parseInt(keys[i], 10);
    const key2 = parseInt(keys[i + 1], 10);

    if (load >= key1 && load < key2) {
      const ratio = (load - key1) / (key2 - key1);
      const color1 = parseInt(values[i].substring(1), 16);
      const color2 = parseInt(values[i + 1].substring(1), 16);

      const r = Math.round(
        (((color2 >> 16) & 0xff) * ratio + ((color1 >> 16) & 0xff) * (1 - ratio))
      );
      const g = Math.round(
        (((color2 >> 8) & 0xff) * ratio + ((color1 >> 8) & 0xff) * (1 - ratio))
      );
      const b = Math.round(
        ((color2 & 0xff) * ratio + (color1 & 0xff) * (1 - ratio))
      );

      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
  }
  return values[0];
};

const getTextColor = (backgroundColor: string) => {
  // Convert hex to RGB
  const r = parseInt(backgroundColor.substring(1, 3), 16);
  const g = parseInt(backgroundColor.substring(3, 5), 16);
  const b = parseInt(backgroundColor.substring(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const filteredSortedGroupedData = React.useMemo(() => {
  return sortedGroupedData;
}, [sortedGroupedData]);

const handleCellClick = async (id_pers: number, id_subject: number, month: number, currentLoad: number) => {
  if (editing && newLoad !== null) {
    //console.log("debug:: month editing.month", month, editing.month);
    //console.log("debug:: id_pers, id_subject, newLoad", id_pers, id_subject, newLoad);
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pers: editing.id_pers,
          id_subject: editing.id_subject,
          month: editing.month,
          load: newLoad,
        }),
      });

      if (response.ok) {

        // --------- 🔥 NOUVEAU : refresh cohérent ----------
        const relatedRes = await fetch(`${API_BASE_URL}/api/related-persons?id_pers=${userId}`);
        const relatedPersons = await relatedRes.json();
        const relatedIds = relatedPersons.map((p: { id_pers: number }) => p.id_pers);

        const dataRes = await fetch(`${API_BASE_URL}/api/data`);
        const serverData = await dataRes.json();
        const filteredData = serverData.filter((item: DataItem) => relatedIds.includes(item.id_pers));

        setData(filteredData);
        processData(filteredData);
        // --------------------------------------------------

      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  setEditing({ id_pers, id_subject, month });
  setNewLoad(currentLoad);
};

const handleCommentClick = (id_pers: number, id_subject: number, currentComment: string) => {
  if (editingComment && newComment !== null) {

    const saveComment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/updateComment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_pers: editingComment.id_pers,
            id_subject: editingComment.id_subject,
            comment: newComment,
          }),
        });

        if (response.ok) {

          // --------- 🔥 NOUVEAU : refresh cohérent ----------
          const relatedRes = await fetch(`${API_BASE_URL}/api/related-persons?id_pers=${userId}`);
          const relatedPersons = await relatedRes.json();
          const relatedIds = relatedPersons.map((p: { id_pers: number }) => p.id_pers);

          const dataRes = await fetch(`${API_BASE_URL}/api/data`);
          const serverData = await dataRes.json();
          const filteredData = serverData.filter((item: DataItem) => relatedIds.includes(item.id_pers));

          setData(filteredData);
          processData(filteredData);
          // --------------------------------------------------

        } else {
          console.error('Failed to save comment');
        }
      } catch (error) {
        console.error('Error saving comment:', error);
      }
    };

    saveComment();
  }

  setEditingComment({ id_pers, id_subject });
  setNewComment(currentComment);
};

if (loading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error: {error}</div>;
}

return (
  <div>
    <h1>Modification</h1>
    <div className="filter-inputs">
      <input
        type="text"
        placeholder="Filter by Name"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />
      <input
        type="text"
        placeholder="Filter by Subject"
        value={subjectFilter}
        onChange={(e) => setSubjectFilter(e.target.value)}
      />
      <input
        type="text"
        placeholder="Filter by Team"
        value={teamFilter}
        onChange={(e) => setTeamFilter(e.target.value)}
      />
      <input
        type="text"
        placeholder="Filter by Type"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      />
      <div className="month-filters">
<select name="minMonth" value={minMonth !== null ? minMonth : ''} onChange={handleMonthChange}>
  <option value="">Min Month</option>
  {selectableMonths.map((month) => (
    <option key={month} value={month}>
      {YYYYMMtoYYYY_MM(month)}
    </option>
  ))}
</select>
<select name="maxMonth" value={maxMonth !== null ? maxMonth : ''} onChange={handleMonthChange}>
  <option value="">Max Month</option>
  {selectableMonths.map((month) => (
    <option key={month} value={month}>
      {YYYYMMtoYYYY_MM(month)}
    </option>
  ))}
</select>
      </div>
    </div>
<div>
<button onClick={() => setShowAddLineForm(!showAddLineForm)}>
  {showAddLineForm ? 'Hide Add New Line' : 'Add New Line'}
</button>
</div>
    {showAddLineForm && (
      <div className="add-line-form">
        <h2>Add New Line</h2>
        <div>
          <label>
            Name and Firstname:
            <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
              <option value="">Select Name and Firstname</option>
              {availableNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Subject:
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Select Subject</option>
              {availableSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={handleAddLine}>Add Line</button>
      </div>
    )}
    <table className="thin-bordered-table">
      <thead>
        <tr>
          <th onClick={() => requestSort('team')} style={{ cursor: 'pointer' }}>
            Team {sortConfig?.key === 'team' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </th>
          <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
            Name {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </th>
          <th onClick={() => requestSort('firstname')} style={{ cursor: 'pointer' }}>
            Firstname {sortConfig?.key === 'firstname' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </th>
          <th onClick={() => requestSort('subject')} style={{ cursor: 'pointer' }}>
            Subject {sortConfig?.key === 'subject' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </th>
          <th onClick={() => requestSort('type')} style={{ cursor: 'pointer' }}>
            Type {sortConfig?.key === 'type' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </th>
          <th>Comment</th>
          {displayedMonths.map((month) => {
            //console.log("debug:: month", month);
            return <th key={month}>{YYYYMMtoYYYY_MM(month)}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {filteredSortedGroupedData.map((item, index) => (
          <tr key={index} style={{ backgroundColor: item.color_hex }}>
            <td>{item.team}</td>
            <td style={{ backgroundColor: item.color_hex }}>{item.name}</td>
            <td style={{ backgroundColor: item.color_hex }}>{item.firstname}</td>
            <td style={{ backgroundColor: item.color_hex }}>{item.subject}</td>
            <td style={{ backgroundColor: item.color_hex }}>{item.type}</td>
            <td style={{ backgroundColor: item.color_hex, fontStyle: 'italic' }}>
              {editingComment?.id_pers === item.id_pers &&
              editingComment?.id_subject === item.id_subject ? (
                <input
                  type="text"
                  value={newComment !== null ? newComment : item.comment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              ) : (
                <span onClick={() => handleCommentClick(item.id_pers, item.id_subject, item.comment)}>
                  {item.comment}
                </span>
              )}
            </td>
            {displayedMonths.map((month) => {
              const monthISOTextFormat = month;
              const load = item.loads[monthISOTextFormat] || 0;
              const isEditing = editing?.id_pers === item.id_pers &&
                                editing?.id_subject === item.id_subject &&
                                editing?.month === month;

              const bgColor = getBackgroundColor(load);
              const textColor = getTextColor(bgColor);
              const cellStyle: React.CSSProperties = {
                backgroundColor: bgColor,
                color: textColor,
                padding: '5px',
                textAlign: 'center' as 'center'
              };

              if (isEditing) {
                return (
                  <td key={month} style={cellStyle}>
                    <input
                      type="number"
                      value={newLoad !== null ? newLoad : load}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 31) {
                          setNewLoad(value);
                        }
                      }}
                      min="0"
                      max="31"
                    />
                  </td>
                );
              } else {
                return (
                  <td key={month} style={cellStyle} onClick={() => handleCellClick(item.id_pers, item.id_subject, month, load)}>
                    {load}
                  </td>
                );
              }
            })}
          </tr>
        ))}
        {Array.from(new Set(filteredSortedGroupedData.map(item => `${item.name} ${item.firstname}`))).map((name, index) => {
          const personData = filteredSortedGroupedData.filter(item => `${item.name} ${item.firstname}` === name);
          const totalLoads = displayedMonths.map(month => personData.reduce((sum, item) => sum + (item.loads[month] || 0), 0));
          return (
            <tr key={`total-${index}`} className="total-row">
              <td colSpan={6} style={{ fontWeight: 'bold' as 'bold', backgroundColor: '#f0f0f0' }}>
                Total for {name}
              </td>
              {displayedMonths.map((month, monthIndex) => {
                const load = totalLoads[monthIndex];
                const bgColor = getBackgroundColor(load);
                const textColor = getTextColor(bgColor);
                const cellStyle: React.CSSProperties = {
                  backgroundColor: bgColor,
                  color: textColor,
                  padding: '5px',
                  textAlign: 'center' as 'center',
                  fontWeight: 'bold' as 'bold'
                };
                return (
                  <td key={month} style={cellStyle}>
                    {load}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
}

export default Modif;
