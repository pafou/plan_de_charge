# Plan de Charge

## Overview

Plan de Charge is a web application for managing and visualizing workload distribution across teams and projects. It provides both frontend and backend functionality to handle user authentication, data management, and administrative tasks.

## Project Structure

The project is organized into three main directories:

- `back/`: Contains the backend server code
- `front/`: Contains the frontend React application
- `sql/`: Contains SQL scripts for database management

## Backend

### Technology Stack

- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT for authentication

### Features

- REST API endpoints for data management
- User authentication and authorization
- CRUD operations for managing teams, subjects, and users
- Data export functionality

### API Documentation

Detailed API documentation is available in [back/Readme.md](back/Readme.md).

## Frontend

### Technology Stack

- React
- TypeScript
- Create React App
- React Router

### Features

- User authentication and selection
- Admin dashboard for managing system configuration
- Data visualization and modification interface
- Responsive design

### Components

- `Admin.tsx`: Main admin interface
- `Modif.tsx`: Data modification interface
- `UserSelect.tsx`: User selection component

## Database

### Structure

The database consists of several tables:

- `t_pers`: Stores person information
- `t_subjects`: Stores subject information
- `t_teams`: Stores team information
- `t_pdc`: Stores workload data
- `t_comment`: Stores comments
- `t_admin`: Stores admin user information
- `t_subject_types`: Stores subject type information
- `t_color_mapping`: Stores color mapping for visualization

### SQL Scripts

SQL scripts for database management are located in the `sql/` directory:

- `10_create_tables.sql`: Table creation script
- `99_01_truncate_tables.sql`: Table truncation script
- `99_02_insert_t_pers.sql`: Person data insertion script
- `99_03_0_insert_t_subject_types.sql`: Subject type insertion script
- `99_03_1_insert_t_subjects.sql`: Subject insertion script
- `99_04_insert_t_comment.sql`: Comment insertion script
- `99_05_color_mapping.sql`: Color mapping insertion script
- `99_07_insert_t_teams.sql`: Team insertion script
- `99_08_update_t_pers.sql`: Person update script
- `99_10_insert_t_admin.sql`: Admin insertion script
- `99_12_insert_t_pdc.sql`: Workload data insertion script
- `delete.sql`: Deletion script

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup

1. Navigate to the `back/` directory
2. Install dependencies: `npm install`
3. Create a `.env` file with your database connection string and JWT secret
4. Start the server: `npm start`

### Frontend Setup

1. Navigate to the `front/` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Database Setup

1. Create a PostgreSQL database
2. Run the SQL scripts in the `sql/` directory to set up the database structure and initial data

## Configuration

### Backend

Configuration is done through environment variables in the `.env` file:

```
DATABASE_URL=postgres://username:password@localhost:5432/database_name
JWT_SECRET=your_secret_key
```

### Frontend

Frontend configuration is done through the `src/apiConfig.ts` file:

```typescript
export const API_BASE_URL = 'http://localhost:5001';
```

## Usage

### Authentication

1. Select a user from the user selection dropdown
2. The application will generate a JWT token for the selected user
3. The token will be stored in localStorage and used for subsequent API requests

### Admin Interface

1. Log in as an admin user
2. Access the admin dashboard to manage:
   - Users and permissions
   - Teams and team members
   - Subjects and subject types
   - Color mapping for visualization

### Data Modification

1. Use the Modif interface to:
   - View and filter workload data
   - Add new data entries
   - Update existing data
   - Add comments

## Development

### Backend

- TypeScript configuration is in `back/tsconfig.json`
- The main server file is `back/src/index.ts`

### Frontend

- TypeScript configuration is in `front/tsconfig.json`
- The main application file is `front/src/App.tsx`

## Testing

### Backend

- No specific testing framework is currently configured
- Manual testing through API endpoints

### Frontend

- No specific testing framework is currently configured
- Manual testing through the React components

## Contributing

1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Created by Pascal Fouquet
- Based on the plan_de_charge project
