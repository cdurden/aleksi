from setuptools import setup

requires = [
    'filemagic',
    'passlib',
    'bcrypt',
    'pyparsing', # should be removed soon
    'bs4',
    'sqlalchemy',
    'pyramid_chameleon',
    'social-auth-core',
    'social-auth-app-pyramid',
    'pyramid',
    'pyramid_tm',
    'pyramid_beaker',
    'waitress',
    'zope.sqlalchemy',
]

setup(name='aleksi',
      install_requires=requires,
      entry_points="""\
      [paste.app_factory]
      main = aleksi:main
      [console_scripts]
      initdb = aleksi.initdb:main
      """,
)
