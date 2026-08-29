Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

.\venv\Scripts\Activate.ps1
cd backend
python manage.py migrate
python manage.py seed
python manage.py runserver 8000


Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd frontend
npm run dev

LOGIN ADMIN 
USER: admin
PASSWORD: admin