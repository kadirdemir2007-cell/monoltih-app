from fastapi import FastAPI

fastapi_app = FastAPI()

@fastapi_app.get("/api/fastapi/hello")
async def hello():
    return {"message": "Hello from FastAPI"}