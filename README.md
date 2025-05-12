
# 📚 Trackly – Assignment & Test Deadline Tracker

**Trackly** is a minimalist, glassmorphic productivity app that helps students track assignments and surprise tests with ease. Built using the **MERN stack**, it features secure authentication, deadline tracking, and a beautiful permanent dark mode UI.

---

## 🚀 Features

- 🔐 **Authentication**
  - Secure login & signup using JWT
  - Passwords hashed with bcrypt

- 📅 **Task Manager**
  - Add, edit, delete assignments and tests
  - Set deadlines, priorities, and completion status
  - View upcoming & overdue tasks

- 🖼️ **Modern UI**
  - Fully responsive design
  - Dark mode always enabled
  - **Glassmorphism** styling with Tailwind CSS

- 🔄 **REST API (Node + Express)**
  - Modular API with authentication middleware
  - MongoDB (Mongoose) models for Users & Tasks

---

## 🧱 Tech Stack

| Layer         | Technology             |
|---------------|------------------------|
| Frontend      | React.js, Tailwind CSS |
| Backend       | Node.js, Express.js    |
| Database      | MongoDB (Mongoose)     |
| Auth          | JWT, Bcrypt            |

---

## 📁 Folder Structure (Client Components)

```

client/
└── src/
└── components/
├── Landing/
├── Auth/
├── Dashboard/
├── Task/
├── Common/
└── Calendar/   // (Optional)

````

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/trackly.git
cd trackly
````

### 2. Install Dependencies

#### For the Backend:

```bash
cd server
npm install
```

#### For the Frontend:

```bash
cd client
npm install
```

### 3. Set Environment Variables

Create a `.env` file inside `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the App

```bash
# Start backend
cd server
npm run dev

# In another terminal, start frontend
cd client
npm run dev
```

---


Absolutely! Here's the updated **📌 Future Improvements** section with your new features, ready to be copied into your `README.md`:

---

## 📌 Future Improvements

* 📆 **Calendar View** – Visualize upcoming deadlines with date highlights
* 🔍 **Task Filters** – Filter tasks by type, priority, and deadline
* 📤 **CSV Export** – Export task data for backup or analysis
* 📧 **Deadline Reminders** – Email or in-app notifications for due tasks
* 🔗 **Google Calendar Sync** – Auto-sync tasks with your Google Calendar

---

### 🔐 Authentication

* **Google OAuth2 Login**

  * Integrate Firebase Auth or Passport.js
  * Allow users to sign in using Google account

---

### 📄 File Upload + AI Assistance

* **Upload Assignment PDFs**

  * Attach a PDF to any task (e.g., assignment question file)

* **AI-Powered Answer Generation**

  * After upload, display a **"Get AI Answers"** button
  * On click, use **Gemini API** to:

    * Extract key questions or prompts
    * Generate summarized answers
  * Save AI-generated answers to MongoDB
  * Display answers beneath the corresponding task card in the UI



## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License © [Amaanx6](https://github.com/Amaanx6)

```


