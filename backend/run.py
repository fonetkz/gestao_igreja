import uvicorn
from backend.config import API_HOST, API_PORT
from backend.main import app

if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT, log_level="info")