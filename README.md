# AI Student Notebook

## 📌 Overview

The AI Student Notebook is a web-based application designed to help students organize, understand, and study their notes more effectively. Users can upload notes, generate AI-powered summaries, and create practice questions to support active recall.

---

## 🎯 Core Features (MVP)

- Upload or input notes  
- Organize notes into classes/folders  
- Generate AI summaries  
- Generate active recall questions  
- View and revisit saved notes  

---

## ⭐ Optional Features (If Time Allows)

- Simplified explanations  
- OCR for handwritten notes  
- AI chat for clarification  
- Calendar / reminders  
- User authentication  

---

## 🧩 User Stories & Tasks

### 1. Notes Input

**User Story:**  
As a user, I want to upload or enter my notes so that I can store my study material.

**Tasks:**

- Create frontend input (text box or file upload UI)  
- Capture user input in frontend state  
- Send input to backend via API request  
- Create backend endpoint to receive notes  
- Store notes (temporary or database)  
- Return stored note data to frontend  
- Display notes in UI  

---

### 2. Organize Notes

**User Story:**  
As a user, I want to organize my notes into classes/folders.

**Tasks:**

- Create frontend UI for folders/classes  
- Create backend endpoints for folder creation and assignment  
- Design database structure for folders and note relationships  
- Store folder and note associations in database  
- Fetch grouped notes from backend  
- Display notes organized by folder in UI  

---

### 3. AI Summary

**User Story:**  
As a user, I want to generate a summary of my notes.

**Tasks:**

- Add "Generate Summary" button in frontend  
- Send selected note text to backend  
- Create backend route for summary generation  
- Integrate OpenAI API in backend  
- Process AI response and extract summary  
- Return summary to frontend  
- Display summary in UI  

---

### 4. Active Recall Questions

**User Story:**  
As a user, I want practice questions from my notes.

**Tasks:**

- Add "Generate Questions" button in frontend  
- Send note text to backend  
- Create backend route for question generation  
- Use OpenAI API to generate questions  
- Process response into structured format  
- Return questions to frontend  
- Display questions clearly (list or formatted view)  

---

### 5. View Saved Notes

**User Story:**  
As a user, I want to view previously saved notes.

**Tasks:**

- Store notes persistently in database  
- Create backend endpoint to fetch notes  
- Retrieve notes from database  
- Send notes to frontend  
- Create UI for notes list  
- Allow user to select and open a note  

---

## ⚙️ System Tasks

### Backend
- Set up Node.js server (Express)  
- Create API routes (notes, summaries, questions, folders)  
- Handle communication with OpenAI API  
- Manage request/response flow  

### Database
- Use MongoDB (or simple JSON/local storage initially)  
- Design schema for notes and folders  
- Store notes and generated outputs  
- Connect backend to database  

### Frontend
- Use React for UI  
- Build components (input, notes list, summary view, questions view)  
- Handle state management  
- Connect frontend to backend APIs  

---

## 🛠️ Tech Stack

- Frontend: React  
- Backend: Node.js with Express  
- AI Integration: Groq API  
- Database: MongoDB (or local storage for initial version)  

---

## 👥 Team

- Anna Mason  
- Khang Ngo  
- Jay McCall  

---

## 📅 Weekly Updates

### Week of April 5

- Initialized React frontend using Vite
- Set up project folder structure and README
- Replaced default UI with basic app layout

### Week of April 12

- Backend setup.
- UI for website is now up and running.
- Can create notes and summarization.
- Folders can be created. 
- API calls to Groq now works. Rather than pay 5 bucks for OpenAI, Groq is free.

**Next:**

- Continue working on the folders feature
- Ability to save notes.
- Work on creating active recall page. Too complex, not sure how to do it. Probably last thing to be implemented.
- Setup database to save user's progress and log in information.

---

## 📌 Work Assignment (Update as Needed)

| Task | Assigned To | Status | Date |
|------|------------|--------|------|
| Setup repository | Anna | Done | 3/31/26 |
| Setup React and default UI page | Anna | Done | 4/4/26
| README + planning | Anna | In Progress | 4/4/26 |
| Set up backend project (Node.js + Express server) | Anna | In Progress | 4/4/26 |
| UI for Note Taking page | Khang | Done | 4/10/26
| Backend (Node.js + express) is setup | Khang | Done | 4/12/26
| Hook up API call to Groq | Khang | Done | 4/12/26
| Folders feature implementation | Khang | Done | 4/18/26

---

## 🧠 Notes

- This project focuses on a working MVP first  
- Optional features will be implemented if time allows  
- Progress will be tracked through README updates and team communication  

---
To run frontend/backend:

Move to frontend/backend directory

Backend: npm run start

Frontend: npm run dev

*If one won't start, check that the port isn't already in use.