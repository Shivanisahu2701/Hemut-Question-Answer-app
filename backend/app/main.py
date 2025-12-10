from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import asyncio
from . import database, crud, schemas, auth, websocket_manager, webhook
from .models import Question
app = FastAPI(title="QnA Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database.init_db()
manager = websocket_manager.ConnectionManager()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()



# --- Registration ---
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(crud.models.User).filter(crud.models.User.name == user.name).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(crud.models.User).filter(crud.models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = crud.create_user(db, user, is_admin=user.is_admin)
    return new_user

# --- Login ---
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = auth.create_access_token({
        "sub": user.name,   
        "user_id": user.id,
        "is_admin": user.is_admin
    })
    print( user.is_admin,"++++++++++++++++++++++++++++++++++++++++++++++++++++")
    a= {"access_token": token,"token_type": "bearer", "is_admin": user.is_admin,}
    print(a)
    return a

# --- Questions ---
@app.post("/questions", response_model=schemas.QuestionOut)
async def submit_question(payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be blank")
    q = crud.create_question(db, payload.message)
    asyncio.create_task(manager.broadcast({
        "event": "new_question",
        "data": schemas.QuestionOut.from_orm(q).dict()
    }))
    return q

# @app.get("/questions", response_model=list[schemas.QuestionOut])
# def get_questions(db: Session = Depends(get_db)):
#     return crud.list_questions(db)
@app.get("/questions", response_model=list[schemas.QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    # Order: Escalated first, then Pending, then Answered, newest first
    questions = db.query(Question).all()
    status_priority = {"escalated": 3, "pending": 2, "answered": 1}
    questions.sort(
        key=lambda q: (status_priority.get(q.status, 0), q.created_at),
        reverse=True
    )
    return questions



# --- Admin ---
def authorize_admin(authorization: Optional[str] = Header(default=None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    scheme, _, token = authorization.partition(" ")
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(crud.models.User).filter(crud.models.User.id == payload.get("user_id")).first()
    if not user or user.is_admin != 1:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@app.post("/questions/{question_id}/answer", response_model=schemas.QuestionOut)
async def mark_answered(question_id: int, user: crud.models.User = Depends(authorize_admin), db: Session = Depends(get_db)):
    q = crud.mark_answered(db, question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    asyncio.create_task(manager.broadcast({
        "event": "question_answered",
        "data": schemas.QuestionOut.from_orm(q).dict()
    }))
    webhook.call_webhook({"event": "question_answered", "question_id": q.question_id})
    return q

@app.post("/questions/{question_id}/escalate", response_model=schemas.QuestionOut)
async def escalate(question_id: int, db: Session = Depends(get_db)):
    q = crud.escalate_question(db, question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    asyncio.create_task(manager.broadcast({
        "event": "question_escalated",
        "data": schemas.QuestionOut.from_orm(q).dict()
    }))
    return q

# --- WebSocket ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
