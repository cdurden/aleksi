import os
import sys

from sqlalchemy import engine_from_config

from pyramid.paster import get_appsettings, setup_logging
from pyramid.scripts.common import parse_vars

from social_pyramid.models import init_social

from aleksi import get_settings
from aleksi.models import DBSession, Base
from aleksi import social_auth_settings
from aleksi.models.user import User
from aleksi.models.website import Website
from aleksi.models.session import Session, Pin
from aleksi.models.sanakirja import *


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri> [var=value]\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) < 2:
        usage(argv)
    config_uri = argv[1]
    options = parse_vars(argv[2:])
    setup_logging(config_uri)
    settings = get_appsettings(config_uri, options=options)
    init_social(get_settings(social_auth_settings), Base, DBSession)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    print(Base.metadata)
    for t in Base.metadata.sorted_tables:
        print(t.name)
    Base.metadata.create_all(engine)


if __name__ == '__main__':
    main()
