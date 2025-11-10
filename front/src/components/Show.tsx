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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Show Page</h1>
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
          {sortedGroupedData.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.firstname}</td>
              <td>{item.subject}</td>
              <td>{item.comment}</td>
              {filteredMonths.map((month) => (
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
