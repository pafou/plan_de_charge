import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';
import colorMapping from '../colorMapping.json';
import './Modif.css';

interface DataItem {
  id_pers: number;
  id_subject: number;
  name: string;
  firstname: string;
  subject: string;
  comment?: string;
  month: string;
  load: number;
}

interface GroupedData {
  id_pers: number;
  id_subject: number;
  name: string;
  firstname: string;
  subject: string;
  comment: string;
  loads: { [key: string]: number };
  [key: string]: any;
}

function Modif() {
  const [data, setData] = useState<DataItem[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [minMonth, setMinMonth] = useState<string>('');
  const [maxMonth, setMaxMonth] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched data:', data);
        setData(data);
        processData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const processData = (data: DataItem[]) => {
    const grouped: { [key: string]: GroupedData } = {};
    const monthsSet = new Set<string>();

    data.forEach((item) => {
      const key = `${item.name}-${item.firstname}-${item.subject}-${item.comment || 'No comment'}`;
      monthsSet.add(item.month);

      if (!grouped[key]) {
        grouped[key] = {
          id_pers: item.id_pers,
          id_subject: item.id_subject,
          name: item.name,
          firstname: item.firstname,
          subject: item.subject,
          comment: item.comment || 'No comment',
          loads: {},
        };
      }

      grouped[key].loads[item.month] = item.load;
    });

    setGroupedData(Object.values(grouped));
    setMonths(Array.from(monthsSet).sort());
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

    return filteredItems;
  }, [groupedData, nameFilter, subjectFilter]);

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
    if (name === 'minMonth') {
      if (!maxMonth || value <= maxMonth) {
        setMinMonth(value);
      }
    } else if (name === 'maxMonth') {
      if (!minMonth || value >= minMonth) {
        setMaxMonth(value);
      }
    }
  };

  const getFilteredMonths = () => {
    if (!minMonth && !maxMonth) {
      return months;
    }
    return months.filter(month => {
      if (minMonth && maxMonth) {
        return month >= minMonth && month <= maxMonth;
      }
      if (minMonth) {
        return month >= minMonth;
      }
      if (maxMonth) {
        return month <= maxMonth;
      }
      return true;
    });
  };

  const filteredMonths = getFilteredMonths();

  const getLoadSum = (item: GroupedData) => {
    return filteredMonths.reduce((sum, month) => sum + (item.loads[month] || 0), 0);
  };

  const getBackgroundColor = (load: number) => {
    const keys = Object.keys(colorMapping) as Array<keyof typeof colorMapping>;
    const values = Object.values(colorMapping);

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
          ((color2 >> 16) & 0xff) * ratio + ((color1 >> 16) & 0xff) * (1 - ratio)
        );
        const g = Math.round(
          ((color2 >> 8) & 0xff) * ratio + ((color1 >> 8) & 0xff) * (1 - ratio)
        );
        const b = Math.round(
          (color2 & 0xff) * ratio + (color1 & 0xff) * (1 - ratio)
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
    return sortedGroupedData.filter(item => getLoadSum(item) > 0);
  }, [sortedGroupedData, filteredMonths]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Modif Page</h1>
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
        <div className="month-filters">
          <select name="minMonth" value={minMonth} onChange={handleMonthChange}>
            <option value="">Min Month</option>
            {months.map((month) => {
              const date = new Date(month);
              const formattedMonth = `${date.getFullYear()} ${(date.getMonth() + 1).toString().padStart(2, '0')}`;
              return (
                <option key={month} value={month}>
                  {formattedMonth}
                </option>
              );
            })}
          </select>
          <select name="maxMonth" value={maxMonth} onChange={handleMonthChange}>
            <option value="">Max Month</option>
            {months.map((month) => {
              const date = new Date(month);
              const formattedMonth = `${date.getFullYear()} ${(date.getMonth() + 1).toString().padStart(2, '0')}`;
              return (
                <option key={month} value={month}>
                  {formattedMonth}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div>
        <button onClick={() => requestSort('name')}>Sort by Name</button>
        <button onClick={() => requestSort('subject')}>Sort by Subject</button>
      </div>
      <table className="thin-bordered-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject ID</th>
            <th>Name</th>
            <th>Firstname</th>
            <th>Subject</th>
            <th>Comment</th>
            {filteredMonths.map((month) => {
              const date = new Date(month);
              const monthYear = `${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getFullYear().toString().slice(-2)}`;
              return <th key={month}>{monthYear}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {filteredSortedGroupedData.map((item, index) => (
            <tr key={index}>
              <td>{item.id_pers}</td>
              <td>{item.id_subject}</td>
              <td>{item.name}</td>
              <td>{item.firstname}</td>
              <td>{item.subject}</td>
              <td>{item.comment}</td>
              {filteredMonths.map((month) => {
                const load = item.loads[month] || 0;
                const bgColor = getBackgroundColor(load);
                const textColor = getTextColor(bgColor);
                const cellStyle: React.CSSProperties = {
                  backgroundColor: bgColor,
                  color: textColor,
                  padding: '5px',
                  textAlign: 'center' as 'center'
                };

                return (
                  <td key={month} style={cellStyle}>
                    {load}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Modif;
