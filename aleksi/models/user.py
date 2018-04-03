from . import Base
from passlib.hash import bcrypt

from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    String,
    Boolean,
    )

from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(200), nullable=False, unique=True)
    email = Column(String(200), nullable=False, unique=True)
    password = Column(String(200), nullable=False)
    name = Column(String(100))
    active = Column(Boolean, default=True)
    sessions = relationship("Session")

    def is_active(self):
        return self.active

    def is_authenticated(self):
        return True

    def set_password(self, password):
        self.password = bcrypt.encrypt(password)

    def validate_password(self, password):
        return bcrypt.verify(password, self.password)
