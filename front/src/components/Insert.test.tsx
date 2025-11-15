import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Insert from './Insert';

const mockPersons = [
  { id_pers: 1, name: 'Doe', firstname: 'John' },
  { id_pers: 2, name: 'Smith', firstname: 'Jane' }
];

const mockSubjects = [
  { id_subject: 101, subject: 'Math' },
  { id_subject: 102, subject: 'Science' }
];

test('renders Insert component and displays selected data', () => {
  render(<Insert persons={mockPersons} subjects={mockSubjects} />);

  // Select a person
  const personSelect = screen.getByLabelText(/select person/i);
  fireEvent.change(personSelect, { target: { value: '1' } });

  // Select a subject
  const subjectSelect = screen.getByLabelText(/select subject/i);
  fireEvent.change(subjectSelect, { target: { value: '101' } });

  // Select a month
  const monthSelect = screen.getByLabelText(/select month/i);
  fireEvent.change(monthSelect, { target: { value: '01/2023' } });

  // Submit the form
  const submitButton = screen.getByText(/submit/i);
  fireEvent.click(submitButton);

  // Check if the selected data is displayed
  expect(screen.getByText(/id_pers: 1/i)).toBeInTheDocument();
  expect(screen.getByText(/id_subject: 101/i)).toBeInTheDocument();
  expect(screen.getByText(/month: 01\/2023/i)).toBeInTheDocument();
});
