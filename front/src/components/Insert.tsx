import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';

interface Person {
  ID_pers: number;
  name: string;
  firstname: string;
}

interface Subject {
  ID_subject: number;
  subject: string;
}

interface InsertProps {
  persons?: Person[];
  subjects?: Subject[];
}

const Insert: React.FC<InsertProps> = ({ persons: initialPersons, subjects: initialSubjects }) => {
  const [persons, setPersons] = useState<Person[]>(initialPersons || []);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects || []);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedLoad, setSelectedLoad] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ idPers: number | null, idSubject: number | null, month: string | null, load: number | null }>({ idPers: null, idSubject: null, month: null, load: null });

  useEffect(() => {
    if (!initialPersons || !initialSubjects) {
      // Fetch persons from the API
      fetch(`${API_BASE_URL}/api/persons`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          // Map API response to expected format
          const mappedData = data.map((person: any) => ({
            ID_pers: person.id_pers,
            name: person.name,
            firstname: person.firstname
          }));
          setPersons(mappedData);
        })
        .catch((error) => {
          setError(error.message);
        });

      // Fetch subjects from the API
      fetch(`${API_BASE_URL}/api/subjects`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          // Map API response to expected format
          const mappedData = data.map((subject: any) => ({
            ID_subject: subject.id_subject,
            subject: subject.subject
          }));
          setSubjects(mappedData);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [initialPersons, initialSubjects]);

  const generateMonthOptions = () => {
    const options = [];
    for (let year = 2022; year <= 2028; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        options.push(`01/${monthStr}/${year}`);
      }
    }
    return options;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Reset error state
    setError(null);

    // Validate selected IDs and load value
    if (!selectedPersonId || !selectedSubjectId || !selectedMonth || !selectedLoad) {
      setError('Please make all selections before submitting');
      return;
    }

    // Validate load value is between 0 and 31
    const loadValue = Number(selectedLoad);
    if (isNaN(loadValue) || loadValue < 0 || loadValue > 31) {
      setError('Load value must be an integer between 0 and 31');
      return;
    }

    // Find the selected person and subject
    const selectedPerson = persons.find(person => person.ID_pers === Number(selectedPersonId));
    const selectedSubject = subjects.find(subject => subject.ID_subject === Number(selectedSubjectId));

    if (selectedPerson && selectedSubject) {
      const [day, month, year] = selectedMonth.split('/');
      const formattedMonth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      try {
        const response = await fetch(`${API_BASE_URL}/api/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ID_pers: selectedPerson.ID_pers,
            ID_subject: selectedSubject.ID_subject,
            month: formattedMonth,
            load: loadValue,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setResult({
          idPers: selectedPerson.ID_pers,
          idSubject: selectedSubject.ID_subject,
          month: formattedMonth,
          load: loadValue,
        });
        alert(result.message);
      } catch (error) {
        setError((error as Error).message);
      }
    } else {
      setError('Error: Selected person or subject not found');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Insert Component</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="person">Select Person:</label>
          <select
            id="person"
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            required
          >
            <option value="">--Please choose a person--</option>
{persons.map((person) => (
              <option key={person.ID_pers} value={person.ID_pers}>
                {person.ID_pers} {person.name} {person.firstname}
              </option>
            ))}
</select>
</div>
        <div>
          <label htmlFor="subject">Select Subject:</label>
          <select
            id="subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            required
          >
            <option value="">--Please choose a subject--</option>
            {subjects.map((subject) => (
              <option key={subject.ID_subject} value={subject.ID_subject}>
                {subject.ID_subject} {subject.subject}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month">Select Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            required
          >
            <option value="">--Please choose a month--</option>
            {generateMonthOptions().map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="load">Load (0-31):</label>
          <input
            type="number"
            id="load"
            value={selectedLoad}
            onChange={(e) => setSelectedLoad(e.target.value)}
            min="0"
            max="31"
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {selectedPersonId && (
        <div className="result">
          <h4>Selected Person ID: {selectedPersonId}</h4>
        </div>
      )}
      {selectedSubjectId && (
        <div className="result">
          <h4>Selected Subject ID: {selectedSubjectId}</h4>
        </div>
      )}
      {selectedMonth && (
        <div className="result">
          <h4>Selected Month: {selectedMonth}</h4>
        </div>
      )}
      {selectedLoad && (
        <div className="result">
          <h4>Selected Load: {selectedLoad}</h4>
        </div>
      )}
      {result.idPers !== null && result.idSubject !== null && result.month !== null && result.load !== null && (
        <div className="result">
          <h3>Selected Data:</h3>
          <p>ID_pers: {result.idPers}</p>
          <p>ID_subject: {result.idSubject}</p>
          <p>Month: {result.month}</p>
          <p>Load: {result.load}</p>
        </div>
      )}
    </div>
  );
};

export default Insert;
