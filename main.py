from contextlib import asynccontextmanager
from fastapi import FastAPI, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from gemini_client import get_answer_from_gemeni
from db import Base, CahatRequests, add_request_data, engine, get_user_request, session


@asynccontextmanager
async def lifespan(app: FastAPI): 
    Base.metadata.create_all(engine)
    print("Database created")
    yield
    


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_my_request(request: Request):
    ip_address = request.client.host
    user_requests = get_user_request(ip_address)
    print(f"User requests: {user_requests}")
    # Convert SQLAlchemy objects to dictionaries
    return [
        {
            "id": req.id,
            "ip_address": req.ip_address,
            "prompt": req.prompt,
            "response": req.response
        }
        for req in user_requests
    ]
    

@app.post("/")
def send_prompt(request: Request, prompt: str = Body(..., embed=True) ):
    ip_address = request.client.host
    answer = get_answer_from_gemeni(prompt)
    add_request_data(ip_address, prompt, answer)
    return {"answer": answer, "ip_address": ip_address}


