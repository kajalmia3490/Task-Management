# Task Management Application

A **React-based Task Management Application** designed to help users organize tasks efficiently across multiple projects/companies. It includes features such as task creation, status tracking, attachments, notifications, and real-time search.

---

## Features

* **Multi-Company / Project Management**: Organize tasks under different companies/projects.
* **Task CRUD Operations**: Create, edit, delete tasks with due dates and status updates.
* **Status Tracking**: Mark tasks as *In Progress* or *Completed*.
* **Attachments**: Upload files like images (PNG, JPG, WebP) and PDFs to tasks.
* **Notifications**: Real-time notifications for task updates.
* **Search & Filters**: Search tasks globally or within specific projects. Filter by status or “Today Only”.
* **Responsive Sidebar**: Mobile-friendly sidebar with toggle for project navigation.
* **User Authentication**: Supports user login and logout.

---

## Tech Stack

* **Frontend**: React, Tailwind CSS
* **State Management**: React Context API
* **Icons**: React Icons (MdDelete, MdOutlineAddCircle, ImAttachment, etc.)
* **Backend**: Can integrate with Node.js / Express or any REST API

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/kajalmia3490/Task-Management.git
cd Task-Management
```

2. Install dependencies:

```bash
npm install
```

3. Run the application:

```bash
npm start
```

4. Open your browser and go to:

```
http://localhost:3000
```

---

## Usage

1. Add a new company/project via the sidebar.
2. Select the active company to view its tasks.
3. Create tasks with a title and due date.
4. Upload attachments to tasks if needed.
5. Mark tasks as completed or undo the status.
6. Search and filter tasks to focus on today’s priorities.
7. Receive notifications for task updates.

---

## Folder Structure

```
/src
  /components   # Reusable components like TaskCard, Modals, Sidebar
  /context      # Context API for Auth, Task, and Folder state
  /pages        # Main pages like Dashboard
  /data         # Sample data or constants
  App.jsx       # Main app
  main.jsx      # Entry point
```
