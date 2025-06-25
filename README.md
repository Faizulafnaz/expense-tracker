# 💸 Expense Tracker – Full Stack App

A simple personal expense-tracking system built using **Django REST Framework** and **React + Vite**.

---

## 📁 Project Structure

```
expense-tracker/
├── backend/       # Django API
└── frontend/      # React + Vite UI
```

---

## ✅ Requirements

- Python 3.8+
- Node.js 18+
- npm or yarn
- Git

---

## ⚙️ Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt  # or install manually and freeze
python manage.py migrate
python manage.py createsuperuser  # to create admin user
python manage.py runserver
```

> Runs at http://localhost:8000

---

## ⚙️ Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

> Runs at http://localhost:5173

---

## 🔐 Authentication

- Session-based login/logout (`/api/login/` and `/api/logout/`)
- Only authenticated users can manage expenses
- Admin can access all users’ expenses
- You can create superuser and then create user using default admin panel on locahos:8000

---

## 📄 API Endpoints

| Method | Endpoint                     | Description                |
|--------|------------------------------|----------------------------|
| POST   | `/api/expenses/`             | Create a new expense       |
| GET    | `/api/expenses/`             | List all user expenses     |
| GET    | `/api/expenses/<id>/`        | Expense details            |
| PUT    | `/api/expenses/<id>/`        | Update expense             |
| DELETE | `/api/expenses/<id>/`        | Delete expense             |
| GET    | `/api/expenses/summary/`     | Summary by category        |
| POST   | `/api/expenses/login/`       | Login                      |
| POST   | `/api/expenses/logout/`      | Logout                     |

---

## 🌐 CORS Settings

In `settings.py`:

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

## 🔧 Features

- Add, edit, delete expenses
- Filter by category/date
- Chart for expenses summary
- Admin panel with global data (same login)
- Login/logout functionality

---

## 📬 Contact

Developed by **Faiz ul Afnaz**  
📧 faizulafnaz22@gmail.com  
📱 +91 8289919017
