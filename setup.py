from setuptools import setup, find_packages

requires = [
    'filemagic',
    'passlib',
    'bcrypt',
    'pyparsing', # should be removed soon
    'bs4',
    'sqlalchemy',
    'pyramid_chameleon',
    'pyramid_debugtoolbar',
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
      packages=find_packages(),
      package_data={
          '': ['templates/*.pt','content/html/*.html','content/css/*.css','content/js/*.js']
          },
      entry_points="""\
      [paste.app_factory]
      main = aleksi:main
      [console_scripts]
      initdb = aleksi.initdb:main
      """,
)
