import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';
import './Show.css';

interface DataItem {
  ID_pers: number;
  name: string;
  firstname: string;
  subject: string;
  comment?: string;
  month: string;
  load: number;
}

interface GroupedData {
  name: string;
  firstname: string;
  subject: string;
  comment: string;
  loads: { [key: string]: number };
  [key: string]: any;
}

function Show() {
  const [data, setData] = useState<DataItem[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
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

  const sortedGroupedData = React.useMemo(() => {
    let sortableItems = [...groupedData];
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
  }, [groupedData, sortConfig]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Show Page</h1>
      <div>
        <button onClick={() => requestSort('name')}>Sort by Name</button>
        <button onClick={() => requestSort('subject')}>Sort by Subject</button>
      </div>
      <table className="thin-bordered-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Firstname</th>
            <th>Subject</th>
            <th>Comment</th>
            {months.map((month) => {
              const date = new Date(month);
              const monthYear = `${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getFullYear().toString().slice(-2)}`;
              return <th key={month}>{monthYear}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {sortedGroupedData.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.firstname}</td>
              <td>{item.subject}</td>
              <td>{item.comment}</td>
              {months.map((month) => (
                <td key={month}>{item.loads[month] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Show;
