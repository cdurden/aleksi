import os
import sys
import transaction

from aleksi import Root, get_settings
from aleksi import social_auth_settings
from aleksi import social_auth_local_settings
from social_pyramid.models import init_social
from sqlalchemy import engine_from_config

from pyramid_beaker import session_factory_from_settings

from pyramid.config import Configurator

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
    Translation,
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

from aleksi.auth import MyAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy



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

    session_factory = session_factory_from_settings(settings)
    config = Configurator(settings=settings, session_factory=session_factory, root_factory=Root, autocommit=True)

    authn_policy = MyAuthenticationPolicy()
    authz_policy = ACLAuthorizationPolicy()
    config.set_authorization_policy(authz_policy)
    config.set_authentication_policy(authn_policy)

    config.registry.settings.update(get_settings(social_auth_settings))
    config.registry.settings.update(social_auth_local_settings.SOCIAL_AUTH_KEYS)
    config.include('social_pyramid')
    config.include('pyramid_beaker')
    config.include('pyramid_chameleon')
#    config.add_route('request_linked_website', '/request_linked_website')
#    config.add_route('inject_js', '/inject_js')
#    config.add_route('link_website', '/link_website')
    # If we change the following route name, we need to update models/website.py accordingly
#    config.add_route('verkkosivu','/verkkosivut/{website_id}.html')
#    config.add_route('request_page','/request_page')
#    config.add_route('sites','/sites')

    config.add_route('create_session', '/create_session')
    config.add_route('dialog', '/dialog/{word}.html')
    config.add_route('analyze_word', '/analyze_word/{word}.html')
    config.add_route('load_session', '/session/{session_id}')
    config.add_route('share_session', '/share_session')
    config.add_route('load_shared_session', '/s/{shared_session_hash}')
    config.add_route('get_shared_session', '/get_shared_session/{shared_session_hash}')
    config.add_route('delete_session', '/delete_session/{session_id}')
    config.add_route('browse_sessions', '/sessions')
    config.add_route('main','')
    config.add_route('about', '/about')
    config.add_route('feed', '/feed')
    config.add_route('signup', '/signup_all')
    config.add_route('signup_email', '/signup')
    config.add_route('set_password', '/set_password')
    config.add_route('signup_email_successful', '/signup_email_successful')
    config.add_route('validate_email', '/validate_email')
    config.add_route('start', '/start')
    config.add_route('login', '/login')
    config.add_route('login_email', '/login_email')
    config.add_route('auth_methods', '/auth_methods')
    config.add_route('is_authed', '/is_authed/{provider}')
    config.add_route('logout', '/logout')
    config.add_route('social.logout', '/logout/{backend}')
    config.add_route('get_quizlet_sets', '/get_quizlet_sets')
    config.add_route('quizlet_save_terms', '/quizlet_save_terms')
    config.add_route('save_pin', '/save_pin')
    config.add_route('save_session', '/save_session')
    config.add_route('get_session', '/get_session')
    config.add_route('pin', '/pin')
    config.add_route('unpin', '/unpin')
    config.add_route('get_pins', '/get_pins')
    config.add_route('email_validation_sent', '/email_verify_sent')
    config.add_route('create_quizlet_set', '/create_quizlet_set')
    config.add_route('sync_to_quizlet', '/sync_to_quizlet')
    config.add_route('update_website', '/update_website')
    config.add_route('set_quizlet_set', '/set_quizlet_set')
    config.add_route('set_website', '/set_website')

    config.add_static_view(name='css', path='aleksi:content/css')
    config.add_static_view(name='js', path='aleksi:content/js')
    config.add_static_view(name='html', path='aleksi:content/html')
    config.add_static_view(name='img', path='aleksi:content/img')
    config.add_static_view(name='static', path='aleksi:content')

    #config.add_request_method(get_user, 'user', reify=True)
    #config.add_request_method(quizlet_sets, 'quizlet_sets', reify=True)

    init_social(config, Base, DBSession)
    config.scan()
    config.scan('social_pyramid')
    Base.metadata.create_all(engine)
#    with transaction.manager:
#        model = Page(title='Root', body='<p>Root</p>')
#        DBSession.add(model)
    
    lang='fin'
    to_lang='en'
    with transaction.manager:
        with open('wikt.words', 'r') as f:
            for line in f:
                word = eval(line)
                if 'senses' in word:
                    for sense in word['senses']:
                        if 'glosses' in sense:
                            for gloss in sense['glosses']:
                                translation = Translation(lemma=word['word'], lang=lang, _from=lang, to=to_lang, text=gloss, source="Wiktionary")
                                #print(gloss)
                                DBSession.add(translation)


if __name__ == "__main__":
        main()
