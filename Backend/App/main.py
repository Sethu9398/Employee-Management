from fastapi import FastAPI
from App.database import engine,Base
from App.routers.userRouter import router as user
from App.models.userModel import User
from App.models.departmentModel import Department

app = FastAPI(
    title="Employee Management Portal",
    description="Backend API for Employee Management System",
    version="1.0.0"
)
# Create database tables
Base.metadata.create_all(bind=engine)

app.include_router(user)

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
