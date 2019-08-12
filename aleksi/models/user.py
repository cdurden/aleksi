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
    Table,
    )

from sqlalchemy.orm import relationship
user_group_association_table = Table('user_group_association', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)
class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False, unique=True)
    users = relationship("User", secondary=user_group_association_table, back_populates="groups")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(200), nullable=False, unique=True)
    email = Column(String(200), nullable=False, unique=True)
    password = Column(String(200))
    name = Column(String(100))
    active = Column(Boolean, default=True)
    sessions = relationship("Session")
    groups = relationship("Group", secondary=user_group_association_table, back_populates="users")

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

    def to_dict(self):
        return({'id': self.id, 'username': self.username, 'email': self.email, 'password': self.password, 'name': self.name, 'active': self.active})
