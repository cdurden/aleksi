import re
import os
import json
import hashlib
from tempfile import mkstemp

from paste.deploy.converters import asbool
from pyramid.response import Response
from pyramid.view import view_config
from pyramid.decorator import reify
from pyramid.renderers import get_renderer
import pyramid.httpexceptions as exc
from pyramid.httpexceptions import HTTPOk
from subprocess import CalledProcessError

from pyramid.view import render_view_to_response

from social_pyramid.utils import load_strategy, load_backend
from social_core.actions import do_complete, do_auth
from social_core.backends.email import EmailAuth
#from social_core.exceptions import AuthForbidden, AuthAlreadyAssociated, AuthCanceled
from aleksi.exceptions import *

from .utils import common_context, associations, url_for
from social_core.utils import sanitize_redirect
from sqlalchemy.orm.exc import NoResultFound


from .models import DBSession, Base, RemoteCall, NoWordDataFound

from aleksi.models.user import User

from aleksi.models.session import SharedSession, Session, Pin
from aleksi.models.website import Website
from aleksi.models.sanakirja import SpanishWordMorph, FinnishWordMorph, WiktionaryInterface, Sanakirja, Word

from sqlalchemy import desc

from .auth import get_user, logout_user, login_user

from social_pyramid.utils import psa

#@view_config(route_name='index', renderer='templates/website_index.pt')
#def index(request):
#    websites = DBSession.query(Website).all()
#    return {'websites': websites}

#@reify
#def main_macros(self):
#    renderer = get_renderer("templates/main_macros.pt")
#    #return renderer.implementation().macros
#    return renderer.implementation()

#@reify
#def dialog_macros(self):
#    renderer = get_renderer("templates/dialog_macros.pt")
#    #return renderer.implementation().macros
#    return renderer.implementation()

def get_settings(module):
    return { key: value for key, value in module.__dict__.items()
              if key not in module.__builtins__ and
                 key not in ['__builtins__', '__file__'] }

@view_config(context=AleksiError, renderer='templates/error.pt')
def error(e, request):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    msg = e.args[0] if e.args else ""
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Error', 'user': user, 'msg': msg}

@view_config(context=EmailValidationFailure, renderer='templates/signup_email.pt')
def email_validation_failure(e, request):
    # If the view has two formal arguments, the first is the context.
    # The context is always available as ``request.context`` too.
    msg = e.args[0] if e.args else ""
    return signup_email(request, msg=msg, do_signup=False)
    #return exc.HTTPFound(request.route_url("signup_email",_query={'msg': 'A user with that email address already exists.'}))

@view_config(context=UserAlreadyExists, renderer='templates/signup_email.pt')
def user_already_exists(e, request):
    # If the view has two formal arguments, the first is the context.
    # The context is always available as ``request.context`` too.
    msg = e.args[0] if e.args else ""
    return signup_email(request, msg=msg, do_signup=False)
    #return exc.HTTPFound(request.route_url("signup_email",_query={'msg': 'A user with that email address already exists.'}))

@view_config(route_name='signup_email', renderer='templates/signup_email.pt')
def signup_email(request, *args, **kwargs):
    try:
        do_signup = kwargs['do_signup']
    except:
        do_signup = True
    if request.method == 'POST' and do_signup:
        email = request.params['email']
        #password = request.params['password']
        try:
            user = DBSession.query(User).filter_by(email=email).one()
            raise UserAlreadyExists("The email address you entered has already been used.")
            # here, we could allow a user who has logged in with Google to set the password, so that he can later login natively
            # We would introduce a condition before raising the exception to check whether the user is associated with a Google account. If so, we would not raise this exception...
        except NoResultFound:
            print("need to validate email")
            request.session['email'] = email 
            strategy = load_strategy(request)
            #request.session['local_password'] = password 
            #strategy = load_strategy(request)
            backend = load_backend(strategy, 'email', 'social:complete')
            #raise exc.HTTPFound(request.route_url("social.complete", backend="email"))
            kwargs['signup'] = True
            return do_complete(backend, login=login_user, *args, **kwargs)
#    if 'email_validated' in request.session:
#        email = request.session['email']
#        password = request.session['local_password']
#        new_user = User(email=email, username=email)
#        new_user.set_password(password)
#        DBSession.add(new_user)
#        DBSession.flush()
#        #raise AuthForbidden(backend, "User create. You may now login.")
#        #return login(request, "User create. You may now login.")
#        return exc.HTTPFound(location=request.route_url('signup_email_successful'))
#        #return HTTPFound(location=request.route_url('index'))
#    try:
#        msg = request.params['msg']
#    except KeyError:
#        try:
#            msg = kwargs['msg']
#        except KeyError:
#            msg = ''
    else:
        try:
            msg = kwargs['msg']
        except KeyError:
            msg = ''
        main_macros = get_renderer('templates/main_macros.pt').implementation()
        here = os.path.dirname(__file__)
        return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Sign-up', 'msg': msg}


@view_config(context=AuthForbidden, renderer='templates/login.pt')
def auth_forbidden(exc, request):
    # If the view has two formal arguments, the first is the context.
    # The context is always available as ``request.context`` too.
    msg = exc.args[0] if exc.args else ""
    return login_email(request, msg=msg, do_login=False)
    #return exc.HTTPFound(request.route_url("get_quizlet_sets"))

@view_config(context=EmailAuthForbidden, renderer='templates/login_email.pt')
def email_auth_forbidden(exc, request):
    # If the view has two formal arguments, the first is the context.
    # The context is always available as ``request.context`` too.
    msg = exc.args[0] if exc.args else ""
    return login_email(request, msg=msg, do_login=False)
    #return exc.HTTPFound(request.route_url("get_quizlet_sets"))

#@view_config(context=AuthCanceled)
#def auth_canceled(e, request):
#    # If the view has two formal arguments, the first is the context.
#    # The context is always available as ``request.context`` too.
#    msg = e.args[0] if e.args else ""
#    #return login(request, msg=msg)
#    return exc.HTTPFound(request.static_path('aleksi:content/html/done.html'))
#
#@view_config(context=AuthAlreadyAssociated)
#def auth_already_associated(e, request):
#    # If the view has two formal arguments, the first is the context.
#    # The context is always available as ``request.context`` too.
#    msg = e.args[0] if e.args else ""
#    #return login(request, msg=msg)
#    return exc.HTTPFound(request.static_path('aleksi:content/html/done.html'))

@view_config(route_name='validate_email')
def validate_email(request, *args, **kwargs):
    print("validate_email view")
    #strategy = load_strategy(request)
    #backend = load_backend(strategy, 'email', "social:begin")
    #strategy = request.strategy

@view_config(route_name='set_password', renderer='templates/set_password.pt')
def set_password(request, *args, **kwargs):
    print(request.session)
    email = request.session['email']
#    strategy = load_strategy(request)
#    partial_token = request.GET.get('partial_pipeline_token')
#    partial = strategy.partial_load(partial_token)
#    context = common_context(
#        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
#        strategy,
#        user=get_user(request),
#        plus_id=request.registry.settings['SOCIAL_AUTH_GOOGLE_PLUS_KEY'],
#        email_required=True,
#        partial_backend_name=partial.backend,
#        partial_token=partial_token
#    )
#    return do_auth(request.backend, *args, **kwargs)
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    return {'request': request, 'main_macros': main_macros, 'title': 'Set password', 'msg': '', 'email': email}


@view_config(route_name='login_email', renderer='templates/login_email.pt')
def login_email(request, *args, **kwargs):
    try:
        do_login = kwargs['do_login']
    except:
        do_login = True
    user=get_user(request)
    if request.method == 'POST' and do_login:
        email = request.params['email']
        password = request.params['password']
        request.session['local_password'] = password
        request.session['email'] = email 
        print(request.session)
        #return HTTPFound(location=request.route_url('index'))
        strategy = load_strategy(request)
        backend = load_backend(strategy, 'email', "social:complete")
        return do_complete(backend, login=login_user, *args, **kwargs)
        #return exc.HTTPFound(location=url_for('social:complete', backend='email', _query={'email': email} ))
    print(request.session)
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    try:
        msg = kwargs['msg']
    except KeyError:
        msg = ''
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Login', 'msg': msg, 'user': user}

@view_config(route_name='login', renderer='templates/login.pt')
def login(request, *args, **kwargs):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    try:
        msg = kwargs['msg']
    except KeyError:
        msg = ''
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Login', 'msg': msg, 'user': user}

@view_config(route_name='start', renderer='templates/start.pt')
def start(request, *args, **kwargs):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Start Page', 'msg': '', 'user': user}


@view_config(route_name='signup_email_successful', renderer='templates/login_email.pt')
def signup_email_successful(request):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    msg = 'Signup successful. You may now login.'
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Login', 'msg': msg, 'user': user}

@view_config(route_name='email_validation_sent', renderer='templates/email_verify_sent.pt')
def email_validation_sent(request):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    return {'request': request, 'main_macros': main_macros, 'title': 'Email validation sent', 'user': user}


@view_config(route_name='signup', renderer='templates/signup.pt')
def signup(request, *args, **kwargs):
    try:
        msg = kwargs['msg']
    except KeyError:
        msg = ''
    user=get_user(request)
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Sign-up', 'msg': msg, 'user': user}

@view_config(route_name='feed', renderer='templates/feed.pt')
def feed(request):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    return {'request': request, 'main_macros': main_macros, 'title': 'Aleksi Article Feed', 'user': user}

@view_config(route_name='main', renderer='templates/about.pt')
@view_config(route_name='about', renderer='templates/about.pt')
def about(request):
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    user=get_user(request)
    return {'request': request, 'main_macros': main_macros, 'title': 'About Aleksi', 'user': user}

@view_config(route_name='browse_sessions', renderer='templates/sessions.pt')
def browse_sessions(request):
    print(request.session)
    # get user
    user=get_user(request)
    if user is None:
        #raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",next=request.current_route_url()))
        #raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
        #raise exc.HTTPFound(request.route_url("social.auth", _query={'next':request.url}))
        request.session['next'] = request.url
        print(request.session)
        raise exc.HTTPFound(request.route_url("start"))
        #raise exc.HTTPFound("{:s}?{:s}={:s}".format(request.route_url("social.auth", backend="quizlet"),"next",request.url))
        #raise exc.HTTPNotFound
    # get user's sessions
    sessions = DBSession.query(Session).all()
    print(user.sessions)
    # render sessions page
    main_macros = get_renderer('templates/main_macros.pt').implementation()
    here = os.path.dirname(__file__)
    snapshot_relpath = os.path.relpath(request.registry.settings['website_snapshot_dir'], here)
    return {'request': request, 'main_macros': main_macros, 'title': user.username + "'s sessions", 'user': user, 'sessions': sessions, 'snapshot_relpath': snapshot_relpath}

@view_config(route_name='delete_session')
def delete_session(request):
    session_id = request.matchdict['session_id']
    # get user
    user=get_user(request)
    if user is None:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # get requested session
    try:
        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    except NoResultFound:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    DBSession.delete(session)
    DBSession.flush()
    return exc.HTTPFound(request.route_url("browse_sessions"))

@view_config(route_name='load_session')
def load_session(request):
    session_id = request.matchdict['session_id']
    # get user
    user=get_user(request)
    if user is None:
        request.session['next'] = request.url
        raise exc.HTTPFound(request.route_url("start"))
        #raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # get requested session
    try:
        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    except NoResultFound:
        request.session['next'] = request.url
        raise exc.HTTPFound(request.route_url("start"))
        #raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # check session permissions for user
    # render session
    # get website by id
    #website = Website.query.get(session.website_id)
    website = session.website
    website.html_path = request.registry.settings['cached_website_dir']
    request.session['aleksi_session_id'] = session_id
    request.context.session = session
    dialog_blank_html = render_view_to_response(request.context, request, name='dialog_blank').body
    navbar_html = render_view_to_response(request.context, request, name='navbar').body
    return Response(website.aleksi_html(request, dialog_blank_html, navbar_html))

@view_config(route_name='load_shared_session')
def load_shared_session(request):
    shared_session_hash = request.matchdict['shared_session_hash']
    shared_session = DBSession.query(SharedSession).filter_by(hash=shared_session_hash).one()
    session = shared_session.session
    # check session permissions for user
    # render session
    # get website by id
    #website = Website.query.get(session.website_id)
    website = session.website
    website.html_path = request.registry.settings['cached_website_dir']
    #request.session['aleksi_session_id'] = session.id
    dialog_blank_html = render_view_to_response(request.context, request, name='dialog_blank').body
    request.context.session = session
    navbar_html = render_view_to_response(request.context, request, name='navbar_noauth').body
    return Response(website.aleksi_html(request, dialog_blank_html, navbar_html))


#@view_config(route_name='index', renderer='templates/sites.pt')
#@view_config(route_name='sites', renderer='templates/sites.pt')
#def sites(request):
#    main = get_renderer('templates/main.pt').implementation()
#    return {'request': request, 'main': main, 'title': 'Finnish language sites'}

#@view_config(route_name='request_page', renderer='templates/request_page.pt')
#def request_page(request):
#    main = get_renderer('templates/main.pt').implementation()
#    return {'request': request, 'main': main, 'title': 'Request Finnish Web Helper for a webpage'}

@view_config(route_name='logout', request_method=('GET', 'POST'), renderer='json')
@view_config(route_name='social.logout', request_method=('GET', 'POST'), renderer='json')
#@psa('social.logout')
def logout(request, redirect_name='next'):
    logout_user(request)
    strategy = load_strategy(request)
    backend_name = request.session['backend_name']
    backend = load_backend(strategy, backend_name, "social:logout")
    #backend = request.backend
    url = backend.strategy.absolute_uri(
        backend.strategy.request_data().get(redirect_name, '') or
        backend.setting('DISCONNECT_REDIRECT_URL') or
        backend.setting('LOGIN_REDIRECT_URL')
    )
    if backend.setting('SANITIZE_REDIRECTS', True):
        allowed_hosts = backend.setting('ALLOWED_REDIRECT_HOSTS', []) + \
                        [backend.strategy.request_host()]
        url = sanitize_redirect(allowed_hosts, url) or \
            backend.setting('DISCONNECT_REDIRECT_URL') or \
            backend.setting('LOGIN_REDIRECT_URL')
#    return { 'authed': False }
    print(url)
    response = backend.strategy.redirect(url)
    return(response)
#    raise exc.HTTPFound(request.route_url("login"))
    #return { 'authed': False }


@view_config(route_name='is_authed', renderer='json')
def is_authed(request):
    provider = request.matchdict['provider']
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    print(user)
    print(context['associated'])
    try:
        social_auth = context['associated'][provider]
        print("authed")
        #return { 'authed': True }
        return True
    except KeyError:
        print("not authed")
        print(provider)
        #return { 'authed': False }
        return False

@view_config(route_name='auth_methods', renderer='aleksi:templates/auth_methods.jinja2')
def auth_methods(request):
    print(get_user(request))
    return common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )

@view_config(route_name='get_pins', renderer='json')
#@reify
def get_pins(request):
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    session_id = request.session['aleksi_session_id']
    session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    pins_data = [];
    for pin in session.pins:
        pins_data.append(pin.to_dict())
    return(pins_data)

#@view_config(route_name='quizlet_sets', renderer='aleksi:templates/quizlet/sets.pt')
@view_config(route_name='get_quizlet_sets', renderer='json')
#@reify
def get_quizlet_sets(request):
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    try:
        social_auth = context['associated']['quizlet']
        print("authed to get quizlet sets")
    except KeyError:
        print(context)
        print("failed to get quizlet sets")
        return {}
    print(social_auth.extra_data)
    print(social_auth.extra_data['access_token'])
    print(social_auth.uid)
    import requests
    r = requests.get('https://api.quizlet.com/2.0/users/'+social_auth.uid+'/sets',
            headers = {'Authorization': 'Bearer {:s}'.format(social_auth.extra_data['access_token'])})
    print(json.dumps(r.json()))
    return r.json()
    #return { 'request': request, 'title': 'Quizlet sets', 'main': main, 'sets': r.json() }

@view_config(route_name='get_session', renderer='json')
#@reify
def get_session(request):
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    session_id = request.session['aleksi_session_id']
    session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    for website in session.websites:
        print(website.title)
    print(session.to_dict())
    return(session.to_dict())

@view_config(route_name='save_pin', renderer='string')
def save_pin(request):
    user=get_user(request)
    data = request.json_body
    print(data)
    session_id = request.session['aleksi_session_id']
    pin_data = data['pin']
    pin = DBSession.query(Pin).get(pin_data['id'])
    pin.fi = pin_data['fi']
    pin.en = pin_data['en']
    DBSession.flush()
    return 'OK'

@view_config(route_name='save_session', renderer='string')
def save_session(request):
    user=get_user(request)
    data = request.json_body
    print(data)
    session_id = request.session['aleksi_session_id']
    #session_id = data['session_id']
    session_title = data['session_title']
    lang = data['lang']
    quizlet_set_id = data['quizlet_set_id']
    link_behavior = data['link_behavior']
    website_setter_value = data['website_setter_value']
    if website_setter_value == 'set_url':
        update_website(request)
    else:
        set_website(request)
    session = DBSession.query(Session).filter_by(id=session_id).one()
    session.title = session_title
    session.quizlet_set_id = quizlet_set_id
    session.link_behavior = link_behavior
    session.lang = lang
    session.save()
    return 'OK'
    #return exc.HTTPFound(request.route_url('quizlet_sets', session_id=session_id))

@view_config(route_name='set_website', renderer='string')
def set_website(request):
    user=get_user(request)
    data = request.json_body
    session_id = request.session['aleksi_session_id']
    #session_id = data['session_id']
    session = DBSession.query(Session).get(session_id)
    new_website_id = data['new_website_id']
    website = DBSession.query(Website).get(new_website_id)
    session.website = website
    session.save()
    return 'OK'

@view_config(route_name='set_quizlet_set', renderer='string')
def set_quizlet_set(request):
    user=get_user(request)
    data = request.json_body
    session_id = request.session['aleksi_session_id']
    #session_id = data['session_id']
    session = DBSession.query(Session).get(session_id)
    new_quizlet_set_id = data['new_quizlet_set_id']
    print('setting quizlet set')
    print(new_quizlet_set_id)
    session.quizlet_set_id = new_quizlet_set_id
    session.save()
    return 'OK'

@view_config(route_name='update_website', renderer='string')
def update_website(request):
    user=get_user(request)
    data = request.json_body
    session_id = request.session['aleksi_session_id']
    #session_id = data['session_id']
    session = DBSession.query(Session).get(session_id)
    url = data['website_url']
    use_cache = data['use_cache']
    regex = re.compile(
        r'^(?:http|ftp)s?://' # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
        r'localhost|' #localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
        r'(?::\d+)?' # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    if regex.match(url):
        f, tempfile_path = mkstemp(dir=request.registry.settings['cached_website_dir'],suffix='.html')
        if use_cache:
            session = DBSession.query(Session).get(session_id)
            website = DBSession.query(Website).join(Website.sessions).filter(Website.url==url, Session.id==session.id).order_by(desc(Website.datetime)).first()
        else:
            website = None
        print(url)
        print(website)
        if website is None: 
            website = Website(url=url, snapshot_path=request.registry.settings['website_snapshot_dir'], html_path=request.registry.settings['cached_website_dir'], phantomjs_script_path=request.registry.settings['phantomjs_script_path'])
            try:
                website.fetch_html(tempfile_path)
            except CalledProcessError:
                raise LoadWebsiteError("An error occurred while trying to load the website you requested. Please check the URL and try again. If the problem persists, contact admin@aleksi.org.")
            html_path = tempfile_path
            f, tempfile_path = mkstemp(dir=request.registry.settings['website_snapshot_dir'],suffix='.png')
            website.make_snapshot(tempfile_path)
            session.websites.append(website)
        session.website = website
        session.save()
        return 'OK'
    else:
        return exc.HTTPBadRequest()
    #return exc.HTTPFound(request.route_url('load_session', session_id=session_id))

#@view_config(route_name='quizlet_data', renderer='json')
#def quizlet_data(request):
#    session_id = request.matchdict['session_id']

@view_config(route_name='analyze_word', renderer='json')
def analyze_word(request):
    word = request.matchdict['word']
    try:
        lang = request.params['lang']
    except KeyError:
        lang = 'fi'
    if lang == 'fi':
        wordmorph = FinnishWordMorph(wordform=word, libvoikko_dir=request.registry.settings['libvoikko_dir'], voikkofi_dir=request.registry.settings['voikkofi_dir'])
    elif lang == 'sp':
        wordmorph = SpanishWordMorph(wordform=word, spanish_morphology_path=request.registry.settings['spanish_morphology_path'])
    wi = WiktionaryInterface(classpath=request.registry.settings['base_dir'], enwikt_db_dir=request.registry.settings['enwikt_db_dir'])
    #sanakirja = Sanakirja(base_dir=request.registry.settings['base_dir'], enwikt_db_dir=request.registry.settings['enwikt_db_dir'], libvoikko_dir=request.registry.settings['libvoikko_dir'], voikkofi_dir=request.registry.settings['voikkofi_dir'])
    print(word)
    regex = re.compile(r"^[0-9]+$")
    if regex.match(word):
        raise exc.HTTPNotFound
    try:
        wordmorph.analyze()
        wordmorph.translate(wi)
        results = wordmorph.to_dict()
        #results = sanakirja.analyze_word(word,fail_on_remote_call=asbool(request.registry.settings['fail_on_remote_call']))
    except NoWordDataFound:
        return exc.HTTPNotFound(headers=[('x-tm', 'commit')])
    except RemoteCall:
        return exc.HTTPNotFound()
    return results 

@view_config(route_name='pin')
def pin(request):
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    print(request.json_body)
    data = request.json_body
    session_id = request.session['aleksi_session_id']
    session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    for pin_data in data['pins']:
        pin = Pin(fi=pin_data['fi'], en=pin_data['en'], session=session, website=session.website)
        DBSession.add(pin)
    DBSession.flush()
    return exc.HTTPFound(request.route_url("get_pins"))

@view_config(route_name='unpin')
def unpin(request):
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    print(request.json_body)
    data = request.json_body
    pin_id = data['pin_id']
    session_id = request.session['aleksi_session_id']
    session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    pin = DBSession.query(Pin).get(pin_id)
    DBSession.delete(pin)
    DBSession.flush()
    return exc.HTTPFound(request.route_url("get_pins"))
    #return { 'request': request, 'title': 'Quizlet sets', 'main': main, 'sets': r.json() }


@view_config(route_name='create_quizlet_set')
def create_quizlet_set(request):
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    try:
        social_auth = context['associated']['quizlet']
    except KeyError:
        return {}
    import requests
    print(request.json_body)
    data = request.json_body
    pins = data['pins']
    if len(pins) >= 2:
        terms = []
        definitions = []
        for pin in pins:
            terms.append(pin['fi'])
            definitions.append(pin['en'])
        print(terms)
        print(definitions)
        submission_data = {'terms[]': terms, 'definitions[]': definitions, 'title': data['new_quizlet_set_title'], 'lang_terms': 'fi', 'lang_definitions': 'en'}
        print(json.dumps(submission_data))
        r = requests.post('https://api.quizlet.com/2.0/sets',
                data = submission_data,
                headers = {'Authorization': 'Bearer {:s}'.format(social_auth.extra_data['access_token'])})
        session_id = request.session['aleksi_session_id']
        session = DBSession.query(Session).get(session_id)
        new_quizlet_set_id = r.json()['set_id']
        print('setting quizlet set')
        print(new_quizlet_set_id)
        session.quizlet_set_id = new_quizlet_set_id
        session.save()
        return exc.HTTPFound(request.route_url("get_quizlet_sets"))
    else:
        raise exc.HTTPBadRequest("You must have at least two pinned words to create a Quizlet study set");

@view_config(route_name='sync_to_quizlet', renderer='json')
def sync_to_quizlet(request):
    session_id = request.session['aleksi_session_id']
    context = common_context(
        request.registry.settings['SOCIAL_AUTH_AUTHENTICATION_BACKENDS'],
        load_strategy(request),
        user=get_user(request),
        plus_id=request.registry.settings.get(
            'SOCIAL_AUTH_GOOGLE_PLUS_KEY'
        ),
    )
    user=get_user(request)
    data = request.json_body
    #prune_on_sync = data['prune_on_sync']
    prune_quizlet_on_sync = data['prune_quizlet_on_sync']
    prune_pins_on_sync = data['prune_pins_on_sync']
    try:
        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    except NoResultFound:
        raise exc.HTTPNotFound
    try:
        social_auth = context['associated']['quizlet']
        print("authed to get quizlet sets")
    except KeyError:
        raise exc.HTTPUnauthorized()
    # Check whether the Quizlet sets of the associated Quizlet user include the quizlet_set_id of the session?
    import requests
    quizlet_set_id = session.quizlet_set_id
    print(quizlet_set_id)
    get_response = requests.get('https://api.quizlet.com/2.0/sets/{:d}/terms'.format(quizlet_set_id),
            headers = {'Authorization': 'Bearer {:s}'.format(social_auth.extra_data['access_token'])})
    if get_response.status_code != 200:
        print("quizlet response not okay")
        raise exc.HTTPUnauthorized()
    pins_from_quizlet = []
    extra_pins_from_quizlet = []
    quizlet_terms = get_response.json()
    for term in quizlet_terms:
        #pins_from_quizlet.append(Pin(fi=result['term'],en=result['definition']))
        if all([pin.fi!=term['term'] or pin.en!=term['definition'] for pin in session.pins]):
            if prune_quizlet_on_sync:
                r = requests.delete('https://api.quizlet.com/2.0/sets/{:d}/terms/{:d}'.format(quizlet_set_id, term['id']),
                    headers = {'Authorization': 'Bearer {:s}'.format(social_auth.extra_data['access_token'])})
                if r.status_code != 204:
                    print(r.status_code)
                    print("quizlet response not okay on delete")
                    raise exc.HTTPUnauthorized()
            else:
                pin = Pin(fi=term['term'],en=term['definition'])
                session.pins.append(pin)

    print(quizlet_terms)
    print([pin.fi for pin in session.pins])
    new_pins = []
    for pin in session.pins:
        print("checking whether to remove pin "+pin.fi)
        if all([term['term']!=pin.fi or term['definition']!=pin.en for term in quizlet_terms]):
            if not prune_pins_on_sync:
                r = requests.post('https://api.quizlet.com/2.0/sets/{:d}/terms'.format(quizlet_set_id),
                    data = {'term': pin.fi, 'definition': pin.en},
                    headers = {'Authorization': 'Bearer {:s}'.format(social_auth.extra_data['access_token'])})
                if r.status_code != 201:
                    print(r.status_code)
                    print("quizlet response not okay on add term")
                    raise exc.HTTPUnauthorized()
        else:
            if prune_pins_on_sync:
                new_pins.append(pin)
                #session.pins.remove(pin)
    if prune_pins_on_sync:
        session.pins = new_pins
    for pin2 in session.pins:
        print(pin2.fi+pin2.en)
    session.save()
    return exc.HTTPFound(request.route_url('get_pins'))
    #raise HTTPOk
    #return { 'request': request, 'title': 'Quizlet sets', 'main': main, 'sets': r.json() }



@view_config(name='aleksi_blank', renderer="templates/dialog.pt")
def aleksi_blank(request):
    session_id = request.matchdict['session_id']
    # get user
    user=get_user(request)
    if user is None:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # get requested session
    try:
        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    except NoResultFound:
        raise exc.HTTPNotFound
    return { 'analysis_results': {'word': None, 'lemmas': [], 'tags': []}, 'request': request, 'session': session }

@view_config(route_name='share_session', renderer='json')
#@view_config(route_name='inject_js')
def share_session(request):
    user=get_user(request)
    data = request.json_body
    print(data)
    session_id = request.session['aleksi_session_id']
    # get user
    if user is None:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # get requested session
    try:
        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    except NoResultFound:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # check session permissions for user
    # render session
    # get website by id
    #website = Website.query.get(session.website_id)
    if session is not None:
        shared_session_hash = hashlib.sha224(json.dumps(session.to_dict(), sort_keys=True).encode('utf-8')).hexdigest()
        shared_session = SharedSession(hash=shared_session_hash, session=session)
        shared_session.save()
    return(shared_session.to_dict())
    #return Response(website.aleksi_html(request, aleksi_blank_html))

@view_config(route_name='get_shared_session')
#@view_config(route_name='inject_js')
def get_shared_session(request):
    session_id = request.matchdict['session_id']
    # get user
    user=get_user(request)
    if user is None:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # get requested session
    try:
        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
    except NoResultFound:
        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
    # check session permissions for user
    # render session
    # get website by id
    #website = Website.query.get(session.website_id)
    shared_session = session.shared_session
    return(shared_session.to_dict())
    #return Response(website.aleksi_html(request, aleksi_blank_html))


@view_config(route_name='create_session')
#@view_config(route_name='inject_js')
def create_session(request):
    url = request.params['url']
    #title = request.params['title']
    regex = re.compile(
        r'^(?:http|ftp)s?://' # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
        r'localhost|' #localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
        r'(?::\d+)?' # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    if regex.match(url):
        f, tempfile_path = mkstemp(dir=request.registry.settings['cached_website_dir'],suffix='.html')
        website = Website(url=url, snapshot_path=request.registry.settings['website_snapshot_dir'], html_path=request.registry.settings['cached_website_dir'], phantomjs_script_path=request.registry.settings['phantomjs_script_path'])
        try:
            website.fetch_html(tempfile_path)
        except CalledProcessError:
            raise LoadWebsiteError("An error occurred while trying to load the website you requested. Please check the URL and try again. If the problem persists, contact admin@aleksi.org.")
        html_path = tempfile_path
        f, tempfile_path = mkstemp(dir=request.registry.settings['website_snapshot_dir'],suffix='.png')
        website.make_snapshot(tempfile_path)
    #aleksi_blank_view = aleksi_blank(request)
    #aleksi_blank_html = render_view_to_response(request.context, request, name='aleksi_blank').body
    #renderer = aleksi_blank_view['_renderer']
    #aleksi_blank_html = render_to_response(renderer,aleksi_blank_view).body
    user=get_user(request)
    if user is not None:
        session = Session(website=website, title=website.title, websites=[website])
        session.owner = user
        session.save()
    return exc.HTTPFound(request.route_url("load_session", session_id=session.id))
    #return Response(website.aleksi_html(request, aleksi_blank_html))

@view_config(name='navbar', renderer="templates/navbar.pt")
@view_config(name='navbar_noauth', renderer="templates/navbar_noauth.pt")
def navbar(request):
#    session_id = request.session['aleksi_session_id']
#    # get user
#    user=get_user(request)
#    if user is None:
#        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
#    # get requested session
#    try:
#        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
#    except NoResultFound:
#        raise exc.HTTPNotFound
#    #dialog_macros = get_renderer('templates/dialog_macros.pt').implementation()
#    #return { 'dialog_macros': dialog_macros, 'request': request, 'session': session}
    return { 'request': request, 'session': request.context.session}

@view_config(name='dialog_blank', renderer="templates/dialog.pt")
@view_config(route_name='dialog',renderer="templates/dialog.pt")
def dialog(request):
#    session_id = request.session['aleksi_session_id']
    if request.matched_route.name == 'dialog':
        try:
            analysis_results = analyze(request)
        # FIXME: do these exceptions function properly?
        except NoWordDataFound:
            return exc.HTTPNotFound(headers=[('x-tm', 'commit')])
        except RemoteCall:
            return exc.HTTPNotFound()
    else:
        analysis_results = {'word': None, 'lemmas': [], 'tags': []}
#    # get user
#    user=get_user(request)
#    if user is None:
#        raise exc.HTTPFound(request.route_url("social.auth", backend="quizlet",_query={'next':request.url}))
#    # get requested session
#    try:
#        session = DBSession.query(Session).filter_by(id=session_id,owner_id=user.id).one()
#    except NoResultFound:
#        raise exc.HTTPNotFound
    dialog_macros = get_renderer('templates/dialog_macros.pt').implementation()
#    return { 'analysis_results': analysis_results, 'dialog_macros': dialog_macros, 'request': request, 'session': session}
    return { 'analysis_results': analysis_results, 'dialog_macros': dialog_macros, 'request': request}
