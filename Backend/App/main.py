from fastapi import FastAPI
from App.database import engine

app = FastAPI(
    title="Employee Management Portal",
    description="Backend API for Employee Management System",
    version="1.0.0"
)

@app.get("/")
def home():
    return{
        "message": "Welcome to Employee Management Portal API",
        "status": "Server is running"
    }

# Check database connection when server starts
try:
    with engine.connect() as connection:
        print("SQL Server Connected Successfully!  ✅")

except Exception as e:
    print("Database Connection Failed!")
    print("Error:", e)
