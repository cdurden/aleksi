import os
import datetime
from sqlalchemy import Date, cast, desc

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

from sqlalchemy import ForeignKey

class QuizletSet(Base):
    __tablename__ = 'quizlet_sets'
    id = Column(Integer, primary_key=True)
    user_id = Column(Text)

    def save(self):
        DBSession.add(self)
        DBSession.commit()

