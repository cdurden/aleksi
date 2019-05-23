import os
import datetime
from sqlalchemy import Date, cast, desc

from .user import User
from .website import Website
from .quizlet import QuizletSet
from . import *

from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    String,
    Boolean,
    )

from sqlalchemy.orm import relationship

from sqlalchemy import Table, ForeignKey


association_table = Table('session_website_association', Base.metadata,
    Column('website_id', Integer, ForeignKey('websites.id')),
    Column('session_id', Integer, ForeignKey('sessions.id'))
)

class SharedSession(Base):
    __tablename__ = 'shared_sessions'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    hash = Column(Text)
    session = relationship("Session", back_populates="shared_session")
    lang = Column(Text)

    def save(self):
        DBSession.add(self)
        DBSession.flush()

    def to_dict(self):
        return({'id': self.id,
                'session_id': self.session_id,
                'hash': self.hash,
                })

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(Integer, primary_key=True)
    title = Column(Text)
    owner_id = Column(Integer, ForeignKey('users.id'))
    permissions = Column(Integer)
    website_id = Column(Integer, ForeignKey('websites.id'))
    last_active = Column(DateTime)
    quizlet_user_id = Column(Text)
    quizlet_set_id = Column(Integer, ForeignKey('quizlet_sets.id'))
    link_behavior = Column(Text, default='disable', server_default='disable')
    lang = Column(Text)
    website = relationship("Website")
    owner = relationship("User", back_populates="sessions")
    pins = relationship("Pin")
    shared_session = relationship("SharedSession", uselist=False)
    #quizlet_set = relationship("QuizletSet")

    websites = relationship(
        "Website",
        backref="sessions",
        secondary=association_table)

    def save(self):
        self.website.save()
        DBSession.add(self)
        DBSession.flush()

    def to_dict(self):
        try:
            shared_session_dict = self.shared_session.to_dict()
        except AttributeError:
            shared_session_dict = None
        return({'id': self.id,
                'website': { 'id': self.website.id, 'url': self.website.url },
                #'quizlet_set': { 'id': self.quizlet_set.id },
                'websites': [website.to_dict() for website in self.websites],
                'shared_session': shared_session_dict,
                'title': self.title,
                'owner': {'id': self.owner.id, 'username': self.owner.username},
                'lang': self.lang,
                'quizlet_set_id': self.quizlet_set_id,
                'quizlet_user_id': self.quizlet_user_id,
                })

class Pin(Base):
    __tablename__ = 'pins'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    website_id = Column(Integer, ForeignKey('websites.id'))
    lemma = Column(Text)
    text = Column(Text)
    _from = Column(Text)
    to = Column(Text)
    source_url = Column(Text)
    session = relationship("Session", back_populates="pins")
    website = relationship("Website", back_populates="pins")

    def to_dict(self):
        if self.website is None:
            return({'id': self.id, 'lemma': self.lemma, 'text': self.text, 'to': self.to, 'from': self._from, 'source_url': self.source_url, 'website': None})
        else:
            return({'id': self.id, 'lemma': self.lemma, 'text': self.text, 'to': self.to, 'from': self._from, 'source_url': self.source_url, 'website': self.website.to_dict()})

