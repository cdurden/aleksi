# coding=utf-8
from pyramid.config import Configurator

from social_pyramid.strategy import PyramidStrategy
from webob.multidict import NoVars

def _request_data(self, merge=True):
    """Return current request data (POST or GET)"""
    if self.request.method == 'POST':
        if merge:
            data = self.request.POST.copy().mixed()
            if not isinstance(self.request.GET, NoVars):
                data.update(self.request.GET.mixed())
        else:
            data = self.request.POST.mixed()
    else:
        data = self.request.GET.mixed()
    return data

PyramidStrategy.request_data = _request_data

#from paste.deploy.converters import asbool
#import pyramid.httpexceptions as exc
#from subprocess import call
#import shlex
#from urllib.parse import urlsplit, urljoin
#from tempfile import mkstemp
import os

from sqlalchemy import engine_from_config
from sqlalchemy.event import listen

from .models import DBSession, Base

here = os.path.dirname(__file__)

from pyramid.session import UnencryptedCookieSessionFactoryConfig
#from pyramid_beaker import BeakerSessionFactoryConfig
from pyramid_beaker import session_factory_from_settings

from aleksi.auth import session_secret
from aleksi.auth import MyAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.security import Allow, Authenticated

#session_secret = '4ab5fdd18e4c74bf5f1fc87945bc49a7'
#session_factory = UnencryptedCookieSessionFactoryConfig(session_secret,timeout=3600)
#session_factory = BeakerSessionFactoryConfig()

from aleksi import social_auth_settings
from aleksi import social_auth_local_settings
from social_pyramid.models import init_social
#from social_pyramid.utils import load_strategy

from .models import initialize_sql


#from pyramid.response import Response
#from pyramid.view import view_config
#from pyramid.decorator import reify
#from pyramid.renderers import get_renderer
#
#
#from .utils import common_context, associations
#
#from aleksi.models.website import Website
#from aleksi.models.sanakirja import Sanakirja,Word
#
from .auth import get_user
from .utils import url_for
#from .views import quizlet_sets


#@view_config(route_name='index', renderer='templates/website_index.pt')
#def index(request):
#    websites = DBSession.query(Website).all()
#    return {'websites': websites}

#@view_config(route_name='request_linked_website', renderer='templates/link_website_form.pt')
#def request_linked_website(request):
#    return {}


#@reify
#def main(self):
#    renderer = get_renderer("templates/main.pt")
#    return renderer.implementation().macros
def get_settings(module):
    return { key: value for key, value in module.__dict__.items()
              if key not in module.__builtins__ and
                 key not in ['__builtins__', '__file__'] }


#@view_config(route_name='index', renderer='templates/sites.pt')
#@view_config(route_name='sites', renderer='templates/sites.pt')
#def sites(request):
#    main = get_renderer('templates/main.pt').implementation()
#    return {'request': request, 'main': main, 'title': 'Finnish language sites'}
#
#@view_config(route_name='request_page', renderer='templates/request_page.pt')
#def request_page(request):
#    main = get_renderer('templates/main.pt').implementation()
#    return {'request': request, 'main': main, 'title': 'Request Finnish Web Helper for a webpage'}
#
#@view_config(route_name='auth_methods', renderer='aleksi:templates/auth_methods.jinja2')
#def auth_methods(request):
#    print(get_user(request))
#    return common_context(
#        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
#        load_strategy(request),
#        user=get_user(request),
#        plus_id=request.registry.settings.get(
#            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
#        ),
#    )
#
#@view_config(route_name='quizlet_sets', renderer='aleksi:templates/auth_methods.jinja2')
#def quizlet_sets(request):
#    user=get_user(request)
#    social_auth = associations(user, load_strategy(request))[0]
#    print(social_auth.extra_data)
#    print(social_auth.extra_data['access_token'])
#    print(social_auth.uid)
#    import requests
#    r = requests.get('https://api.quizlet.com/2.0/users/Chris_Durden?whitespace=1',
#            headers = {'Authorization': 'Bearer {:s}'.format(social_auth.extra_data['access_token'])})
#
#
#@view_config(route_name='inject_js')
#def inject_js(request):
#    url = request.params['url']
#    regex = re.compile(
#        r'^(?:http|ftp)s?://' # http:// or https://
#        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
#        r'localhost|' #localhost...
#        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
#        r'(?::\d+)?' # optional port
#        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
#    if regex.match(url):
#        f, tempfile_path = mkstemp(dir=request.registry.settings['cached_website_dir'])
#        website = Website(url=url)
#        website.fetch_html(tempfile_path)
#    return Response(website.aleksi_html(request))
#
##@view_config(route_name='link_website')
##def link_website(request):
##    url = request.params['url']
##    regex = re.compile(
##        r'^(?:http|ftp)s?://' # http:// or https://
##        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
##        r'localhost|' #localhost...
##        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
##        r'(?::\d+)?' # optional port
##        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
##    if regex.match(url):
##        try:
##            website = get_website_by_url(url, expire_seconds=3600)
##        except:
##            f, tempfile_path = mkstemp(dir=request.registry.settings['cached_website_dir'])
##            website = Website(url=url)
##            website.fetch_html(tempfile_path)
##            DBSession.add(website)
##            DBSession.flush()
##            print(website.cached_copy)
###        return Response(website.aleksi_html(request))
##        return exc.HTTPFound(request.route_url('verkkosivu', website_id=website.id),headers=[('x-tm', 'commit')])
##    else:
##        raise exc.HTTPBadRequest()
##
##@view_config(route_name='verkkosivu')
##def verkkosivu(request):
##    website_id = request.matchdict['website_id']
##    website = DBSession.query(Website).get(website_id)
##    return Response(website.aleksi_html(request))
#
#@view_config(route_name='aleksi_data',renderer="templates/aleksi_data.pt")
#def aleksi_data(request):
##    sanakirja = Sanakirja(os.path.join(here,"suomi_malaga"))
#    sanakirja = Sanakirja(base_dir=request.registry.settings['base_dir'], enwikt_db_dir=request.registry.settings['enwikt_db_dir'])
#    #word_string = request.params['word']
#    word_string = request.matchdict['word']
#    regex = re.compile(r"^[0-9]+$")
#    if regex.match(word_string):
#        raise exc.HTTPNotFound
#    try:
#        aleksi_data = sanakirja.aleksi_data(word_string,fail_on_remote_call=asbool(request.registry.settings['fail_on_remote_call']))
#        #aleksi_data = sanakirja.aleksi_data(word_string,fail_on_remote_call=False)
#    except NoWordDataFound:
#        return exc.HTTPNotFound(headers=[('x-tm', 'commit')])
#    except RemoteCall:
#        return exc.HTTPNotFound()
#    return aleksi_data

def do_connect(dbapi_connection, connection_record):
    # disable pysqlite's emitting of the BEGIN statement entirely.
    # also stops it from emitting COMMIT before any DDL.
    dbapi_connection.isolation_level = None

def do_begin(conn):
    # emit our own BEGIN
    conn.execute("BEGIN")

def commit_veto(request, response):
    xtm = response.headers.getall('x-tm')
    print('x-tm header:'+str(xtm))
    if response.status == '404':
        return False
    if len(xtm):
        return 'commit' not in xtm
    return response.status.startswith(('4', '5'))

class Root(object):
    __acl__ = [ (Allow, Authenticated, 'view') ]
    def __init__(self, request):
        settings = request.registry.settings
        settings['SOCIAL_AUTH_LOGIN_URL'] = request.route_url('start')
        settings['SOCIAL_AUTH_EMAIL_FORM_URL'] = request.route_url('login_email')
        settings['SOCIAL_AUTH_LOGIN_REDIRECT_URL'] = request.route_url('browse_sessions')
        #settings['SOCIAL_AUTH_LOGIN_REDIRECT_URL'] = request.route_url('login_redirect')
        settings['SOCIAL_AUTH_PASSWORD_FORM_URL'] = request.route_url('set_password')
        settings['SOCIAL_AUTH_EMAIL_VALIDATION_URL'] = request.route_url('email_validation_sent')
        request.user = None

def main(global_config, **settings):
#    settings['tm.commit_veto'] = 'aleksi.commit_veto'
#    settings['STRATEGY'] = 'aleksi.PyramidStrategy'
    #settings['SOCIAL_AUTH_LOGIN_URL'] = '/login'
    #settings['SOCIAL_AUTH_EMAIL_FORM_URL'] = '/login_email'
    #settings['SOCIAL_AUTH_PASSWORD_FORM_URL'] = '/set_password'
    #settings['SOCIAL_AUTH_EMAIL_VALIDATION_URL'] = '/email_verify_sent'
    engine = engine_from_config(settings, 'sqlalchemy.')
    session_factory = session_factory_from_settings(settings)
    listen(engine, "connect", do_connect)
    listen(engine, "begin", do_begin)
    initialize_sql(engine)
    #DBSession.configure(bind=engine)
    #Base.metadata.bind = engine
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
    config.add_route('analyse', '/analyse/{word}.json')
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
    config.add_route('login_redirect', '/login_redirect')
    config.add_route('login_email', '/login_email')
    config.add_route('auth_methods', '/auth_methods')
    config.add_route('is_authed', '/is_authed/{provider}')
    config.add_route('logout', '/logout')
    config.add_route('dialog', '/dialog')
    config.add_route('navbar', '/navbar')
    config.add_route('navbar_noauth', '/navbar_noauth')
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


    return config.make_wsgi_app()
