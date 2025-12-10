from sqlalchemy.orm import Session
from . import models, schemas
from typing import Optional
from datetime import datetime

# Create user
def create_user(db: Session, user: schemas.UserCreate, is_admin: bool = False):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,  
        is_admin=1 if is_admin else 0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Authenticate user
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.email == username).first()
    if not user or user.password != password:  
        return None
    return user

# Create question
def create_question(db: Session, message: str, user_id: Optional[int]=None):
    q = models.Question(message=message, user_id=user_id, created_at=datetime.utcnow())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

# List questions
def list_questions(db: Session):
    return db.query(models.Question).order_by(models.Question.status.desc(), models.Question.created_at.desc()).all()

# Mark answered
def mark_answered(db: Session, question_id: int):
    q = db.query(models.Question).filter(models.Question.question_id == question_id).first()
    if not q:
        return None
    q.status = models.QuestionStatus.answered
    db.commit()
    db.refresh(q)
    return q

# Escalate question
def escalate_question(db: Session, question_id: int):
    q = db.query(models.Question).filter(models.Question.question_id == question_id).first()
    if not q:
        return None
    q.status = models.QuestionStatus.escalated
    db.commit()
    db.refresh(q)
    return q
