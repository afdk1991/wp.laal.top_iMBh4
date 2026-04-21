from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users
import models
import uvicorn

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MIXMLAAL FastAPI Admin",
    description="MIXMLAAL Python FastAPI Quick Development Version",
    version="0.0.0.4"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {
        "message": "MIXMLAAL FastAPI Admin System",
        "docs": "/docs",
        "version": "0.0.0.4"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    print("""
    
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   MIXMLAAL FastAPI Admin System Started Successfully!     ║
    ║                                                            ║
    ║   📍 Port: 8082                                           ║
    ║   📝 API Docs: http://localhost:8082/docs                 ║
    ║   🔧 ReDoc: http://localhost:8082/redoc                   ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    uvicorn.run("main:app", host="0.0.0.0", port=8082, reload=True)
