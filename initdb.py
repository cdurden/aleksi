import os
import sys
import transaction

from sqlalchemy import engine_from_config

from pyramid.paster import (
    get_appsettings,
    setup_logging,
    )

from aleksi.models import (
    DBSession,
    Base,
    )
from aleksi.models.sanakirja import (
    Word,
    #MissingWord,
    )
from aleksi.models.website import (
    Website,
    )
from aleksi.models.session import (
    Session,
    )
from aleksi.models.quizlet import (
    QuizletSet,
    )


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri>\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) != 2:
        usage(argv)
    config_uri = argv[1]
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.create_all(engine)
#    with transaction.manager:
#        model = Page(title='Root', body='<p>Root</p>')
#        DBSession.add(model)

if __name__ == "__main__":
        main()
