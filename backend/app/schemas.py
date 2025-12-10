from pydantic import BaseModel,EmailStr
from datetime import datetime
# Input model for registration
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_admin: bool = False 
# Output model
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: int

    class Config:
        orm_mode = True

# JWT token model
class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool 

# Question input
class QuestionCreate(BaseModel):
    message: str

# Question output

class QuestionOut(BaseModel):
    question_id: int
    message: str
    status: str
    created_at: datetime 

    class Config:
        orm_mode = True


