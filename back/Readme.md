# Backend API Documentation

This document provides an overview of the available API endpoints in the backend server.

## Table of Contents

- [Data Endpoints](#data-endpoints)
- [Person Endpoints](#person-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Team Endpoints](#team-endpoints)
- [Subject Endpoints](#subject-endpoints)
- [Subject Type Endpoints](#subject-type-endpoints)
- [Authentication Endpoints](#authentication-endpoints)
- [Utility Endpoints](#utility-endpoints)
- [Color Mapping Endpoints](#color-mapping-endpoints)

## Data Endpoints

### Get All Data

- **Endpoint:** `/api/data`
- **Method:** GET
- **Description:** Fetches all data from the database.
- **Response:** JSON array of data objects.

### Get Data as HTML Table

- **Endpoint:** `/api/list_all`
- **Method:** GET
- **Description:** Fetches all data and returns it as an HTML table.
- **Response:** HTML table.

## Person Endpoints

### Get All Persons

- **Endpoint:** `/api/persons`
- **Method:** GET
- **Description:** Fetches all persons from the database.
- **Response:** JSON array of person objects.

### Get Team Managers

- **Endpoint:** `/api/team-managers`
- **Method:** GET
- **Description:** Fetches all team managers from the database.
- **Response:** JSON array of team manager objects.

### Get Team Members

- **Endpoint:** `/api/team-members`
- **Method:** GET
- **Description:** Fetches all team members from the database.
- **Response:** JSON array of team member objects.

### Update Team Member

- **Endpoint:** `/api/team-members/update`
- **Method:** PUT
- **Description:** Updates a team member's team.
- **Request Body:** JSON object with `id_pers` and `id_team`.
- **Response:** JSON object with success message.

### Create Team Member

- **Endpoint:** `/api/team-members/create`
- **Method:** POST
- **Description:** Creates a new team member.
- **Request Body:** JSON object with `id_pers`, `name`, `firstname`, and `id_team`.
- **Response:** JSON object with success message and new team member ID.

### Update Team Member's Team

- **Endpoint:** `/api/team-members/:id`
- **Method:** PUT
- **Description:** Updates a team member's team.
- **Request Body:** JSON object with `id_team`.
- **Response:** JSON object with success message.

### Delete Team Member

- **Endpoint:** `/api/team-members/:id`
- **Method:** DELETE
- **Description:** Deletes a team member.
- **Response:** JSON object with success message.

## Admin Endpoints

### Get All Admins

- **Endpoint:** `/api/admins`
- **Method:** GET
- **Description:** Fetches all admins from the database.
- **Response:** JSON array of admin objects.

### Delete Admin

- **Endpoint:** `/api/admins/:id`
- **Method:** DELETE
- **Description:** Deletes an admin.
- **Response:** JSON object with success message.

### Add Admin

- **Endpoint:** `/api/admins`
- **Method:** POST
- **Description:** Adds a user as an admin.
- **Request Body:** JSON object with `id_pers`.
- **Response:** JSON object with success message.

## Team Endpoints

### Get All Teams

- **Endpoint:** `/api/teams`
- **Method:** GET
- **Description:** Fetches all teams and their managers from the database.
- **Response:** JSON array of team objects.

### Get Teams with Managers

- **Endpoint:** `/api/teams-with-managers`
- **Method:** GET
- **Description:** Fetches all teams with their managers from the database.
- **Response:** JSON array of team objects.

### Delete Team

- **Endpoint:** `/api/teams/:id`
- **Method:** DELETE
- **Description:** Deletes a team.
- **Response:** JSON object with success message.

### Add Team

- **Endpoint:** `/api/teams`
- **Method:** POST
- **Description:** Adds a new team.
- **Request Body:** JSON object with `team` and `manager_id`.
- **Response:** JSON object with success message.

### Remove Manager from Team

- **Endpoint:** `/api/teams/:teamId/managers/:managerId`
- **Method:** DELETE
- **Description:** Removes a manager from a team.
- **Response:** JSON object with success message.

### Add Manager to Team

- **Endpoint:** `/api/teams/:teamId/managers`
- **Method:** POST
- **Description:** Adds a manager to a team.
- **Request Body:** JSON object with `managerId`.
- **Response:** JSON object with success message.

## Subject Endpoints

### Get All Subjects

- **Endpoint:** `/api/subjects`
- **Method:** GET
- **Description:** Fetches all subjects from the database.
- **Response:** JSON array of subject objects.

### Delete Subject

- **Endpoint:** `/api/subjects/:id`
- **Method:** DELETE
- **Description:** Deletes a subject.
- **Response:** JSON object with success message.

### Update Subject

- **Endpoint:** `/api/subjects/:id`
- **Method:** PUT
- **Description:** Updates a subject.
- **Request Body:** JSON object with `subject` and/or `id_subject_type`.
- **Response:** JSON object with success message.

### Add Subject

- **Endpoint:** `/api/subjects`
- **Method:** POST
- **Description:** Adds a new subject.
- **Request Body:** JSON object with `subject` and `id_subject_type`.
- **Response:** JSON object with success message and new subject ID.

## Subject Type Endpoints

### Get All Subject Types

- **Endpoint:** `/api/subject-types`
- **Method:** GET
- **Description:** Fetches all subject types from the database.
- **Response:** JSON array of subject type objects.

### Add Subject Type

- **Endpoint:** `/api/subject-types`
- **Method:** POST
- **Description:** Adds a new subject type.
- **Request Body:** JSON object with `type`.
- **Response:** JSON object with success message and new subject type ID.

### Update Subject Type

- **Endpoint:** `/api/subject-types/:id`
- **Method:** PUT
- **Description:** Updates a subject type.
- **Request Body:** JSON object with `type`.
- **Response:** JSON object with success message.

### Delete Subject Type

- **Endpoint:** `/api/subject-types/:id`
- **Method:** DELETE
- **Description:** Deletes a subject type.
- **Response:** JSON object with success message.

### Update Subject Type Color

- **Endpoint:** `/api/subject-types/:id/color`
- **Method:** PUT
- **Description:** Updates a subject type color.
- **Request Body:** JSON object with `color`.
- **Response:** JSON object with success message.

## Authentication Endpoints

### Generate JWT Token

- **Endpoint:** `/api/generate-token`
- **Method:** POST
- **Description:** Generates a JWT token for a selected user.
- **Request Body:** JSON object with `userId`.
- **Response:** JSON object with token.

### Check if User is Admin

- **Endpoint:** `/api/is-admin`
- **Method:** GET
- **Description:** Checks if a user is an admin.
- **Headers:** Authorization header with Bearer token.
- **Response:** JSON object with `isAdmin` boolean.

### Check if User is Manager

- **Endpoint:** `/api/is-manager`
- **Method:** GET
- **Description:** Checks if a user is a manager and which team they manage.
- **Headers:** Authorization header with Bearer token.
- **Response:** JSON object with `isManager` boolean and `team` string if manager.

## Utility Endpoints

### Add New Line

- **Endpoint:** `/api/addLine`
- **Method:** POST
- **Description:** Adds a new line to the database.
- **Request Body:** JSON object with `name`, `firstname`, and `subject`.
- **Response:** JSON array of data objects.

### Add New Line (Alternative)

- **Endpoint:** `/api/addNewLine`
- **Method:** POST
- **Description:** Adds a new line to the database using person and subject IDs.
- **Request Body:** JSON object with `id_pers` and `id_subject`.
- **Response:** JSON array of data objects.

### Submit Data

- **Endpoint:** `/api/submit`
- **Method:** POST
- **Description:** Submits data to the database.
- **Request Body:** JSON object with `id_pers`, `id_subject`, `month`, and `load`.
- **Response:** JSON object with success message.

### Update Comment

- **Endpoint:** `/api/updateComment`
- **Method:** POST
- **Description:** Updates a comment in the database.
- **Request Body:** JSON object with `id_pers`, `id_subject`, and `comment`.
- **Response:** JSON object with success message.

### Get Related Persons

- **Endpoint:** `/api/related-persons`
- **Method:** GET
- **Description:** Gets related persons based on id_pers.
- **Query Parameters:** `id_pers` (required)
- **Response:** JSON array of person objects.

### Root Endpoint

- **Endpoint:** `/`
- **Method:** GET
- **Description:** Returns a simple message.
- **Response:** Plain text message.

## Color Mapping Endpoints

### Get Color Mapping

- **Endpoint:** `/api/color-mapping`
- **Method:** GET
- **Description:** Fetches color mapping from the database.
- **Response:** JSON array of color mapping objects.

### Update Color Mapping

- **Endpoint:** `/api/color-mapping/:id`
- **Method:** PUT
- **Description:** Updates a color mapping.
- **Request Body:** JSON object with `color_hex`.
- **Response:** JSON object with success message.

### Add Color Mapping

- **Endpoint:** `/api/color-mapping`
- **Method:** POST
- **Description:** Adds a new color mapping.
- **Request Body:** JSON object with `id_map` and `color_hex`.
- **Response:** JSON object with success message.

### Delete Color Mapping

- **Endpoint:** `/api/color-mapping/:id`
- **Method:** DELETE
- **Description:** Deletes a color mapping.
- **Response:** JSON object with success message.
