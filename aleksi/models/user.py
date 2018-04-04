from . import Base
#from passlib.hash import bcrypt
from passlib.hash import pbkdf2_sha256

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
    password = Column(String(200))
    name = Column(String(100))
    active = Column(Boolean, default=True)
    sessions = relationship("Session")

    def is_active(self):
        return self.active

    def is_authenticated(self):
        return True

    def set_password(self, password):
        self.password = pbkdf2_sha256.hash(password)

    def validate_password(self, password):
        if self.password is None or password is None:
            return False
        else:
            return pbkdf2_sha256.verify(password, self.password)
        #return bcrypt.verify(password, self.password)
