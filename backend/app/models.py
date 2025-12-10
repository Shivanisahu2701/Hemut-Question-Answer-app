from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class QuestionStatus(str, enum.Enum):
    pending = "pending"
    answered = "answered"
    escalated = "escalated"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  
    email = Column(String, unique=True, index=True)
    password = Column(String)  
    is_admin = Column(Integer, default=0)



class Question(Base):
    __tablename__ = "questions"
    question_id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    status = Column(String, default="pending")  
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  
    created_at = Column(DateTime)