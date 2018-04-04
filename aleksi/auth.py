from social_core import utils
import pyramid.httpexceptions as exc
from pyramid.events import subscriber, BeforeRender

from pyramid.session import signed_serialize, signed_deserialize

from social_pyramid.utils import backends

from aleksi.models import DBSession
from aleksi.models.user import User
from aleksi.utils import url_for
from aleksi import smtp_credentials

from sqlalchemy.orm.exc import NoResultFound

from social_core.pipeline.partial import partial
from social_core.exceptions import AuthForbidden, InvalidEmail
from social_core.actions import do_disconnect

session_secret = '4ab5fdd18e4c74bf5f1fc87945bc49a7'
USER_FIELDS = ['username', 'email']

def report(backend, *args, **kwargs):
    print("report")
    return

def validate_email(backend, user=None, *args, **kwargs):
    data = backend.strategy.request_data()
    if 'signature' not in data:
        signature = backend.strategy.session_get('signature', None)
    if 'signature' in data:
        signature = data['signature']
        #backend.strategy.session_set('signature', signature)
    if signature:
        try:
            signed_details = signed_deserialize(signature, session_secret)
#            session = Session.objects.get(pk=signed_details['session_key'])
        except BadSignature:
            raise InvalidEmail(backend)
        email = signed_details['email']
        print(email)
        return {'email_validated': True,
                'email': email}
    else:
        return

def send_validation_email(strategy, backend, code, partial_token):
    print("sending email validation")
    signature = signed_serialize(code.email, session_secret)

    url = url_for('social:complete', backend=backend.name)+'?verification_code='+code.code+"&signature="+signature
    import smtplib
    
    # Import the email modules we'll need
    from email.message import EmailMessage
    
    # Open the plain text file whose name is in textfile for reading.
    msg = EmailMessage()
    msg.set_content(url)
    
    # me == the sender's email address
    # you == the recipient's email address
    msg['Subject'] = 'Aleksi email validation request'
    msg['From'] = 'noreply@aleksi.org'
    msg['To'] = code.email
    
    # Send the message via our own SMTP server.
    s = smtplib.SMTP('email-smtp.us-east-1.amazonaws.com') # fix hardcoding
    s.starttls()
    s.login(smtp_credentials.username, smtp_credentials.password) 
    s.send_message(msg)
    s.quit()

def register_user(strategy, backend, request, details, *args, **kwargs):
    print("register_user")
    if backend.name != 'email' and backend.name != 'google-oauth2':
        return
    # session 'local_password' is set by the pipeline infrastructure
    # because it exists in FIELDS_STORED_IN_SESSION
    if backend.name == 'email':
        email = strategy.session_get('email', None)
    elif backend.name == 'google-oauth2':
        email = kwargs['uid']

    print(email)
    if not email:
        # if we return something besides a dict or None, then that is
        # returned to the user -- in this case we will redirect to a
        # view that can be used to get a email
        return exc.HTTPFound(request.route_url("login_email"))

    # grab the user object from the database (remember that they may
    # not be logged in yet) and set their password.  (Assumes that the
    # email address was captured in an earlier step.)
    try:
        user = DBSession.query(User).filter_by(email=email).one()
    except NoResultFound:
        raise AuthForbidden(backend, "Email or password not valid")

    return {'user': user, 'email': email}
@partial
def create_user(strategy, backend, request, details, *args, **kwargs):
    print("create_user")
    if backend.name != 'email' and backend.name != 'google-oauth2':
        return
    # session 'local_password' is set by the pipeline infrastructure
    # because it exists in FIELDS_STORED_IN_SESSION
    if backend.name == 'email':
        email = strategy.session_get('email', None)
    elif backend.name == 'google-oauth2':
        email = kwargs['uid']

    print(email)
    if not email:
        # if we return something besides a dict or None, then that is
        # returned to the user -- in this case we will redirect to a
        # view that can be used to get a email
        return exc.HTTPFound(request.route_url("login_email"))

    # grab the user object from the database (remember that they may
    # not be logged in yet) and set their password.  (Assumes that the
    # email address was captured in an earlier step.)
    try:
        user = DBSession.query(User).filter_by(email=email).one()
    except NoResultFound:
        user = User(email=email, username=email)

    if 'password' in details:
        user.set_password(details['password'])
        #raise AuthForbidden(backend, "Email or password not valid")

    return {'user': user, 'email': email}

def disassociate_social_user(backend, uid, user=None, *args, **kwargs):
    provider = backend.name
    social = backend.strategy.storage.user.get_social_auth(provider, uid)
    print("disassociate social user")
    print(uid)
    print(user)
    if social:
        print("social found")
        print(social)
        print(social.user)
        print(social.user_id)
        social_user = social.get_user(social.user_id)
        print(social_user)
        if social_user is None:
            return
        if user and social_user != user:
            print("disconnecting social user")
#            msg = 'This {0} account is already in use.'.format(provider)
#            raise AuthAlreadyAssociated(backend, msg)
            do_disconnect(backend, social_user, None)
    return {'social': social,
            'user': user,
            'is_new': user is None,
            'new_association': social is None}

def social_user(backend, uid, user=None, *args, **kwargs):
    provider = backend.name
    social = backend.strategy.storage.user.get_social_auth(provider, uid)
    print("social user")
    print(uid)
    print(user)
    if social:
        print(social.user)
        if user and social.user != user and social.user is not None:
            msg = 'This {0} account is already in use.'.format(provider)
            raise AuthAlreadyAssociated(backend, msg)
    return {'social': social,
            'user': user,
            'is_new': user is None,
            'new_association': social is None}

def associate_user(backend, uid, user=None, social=None, *args, **kwargs):
    print("associate social user")
    print(uid)
    print(user)
    print(social)
    #if user and not social:
    if user and not social:
        try:
            print(user)
            print(uid)
            social = backend.strategy.storage.user.create_social_auth(
                user, uid, backend.name
            )
        except Exception as err:
            if not backend.strategy.storage.is_integrity_error(err):
                raise
            # Protect for possible race condition, those bastard with FTL
            # clicking capabilities, check issue #131:
            #   https://github.com/omab/django-social-auth/issues/131
            return social_user(backend, uid, user, *args, **kwargs)
        else:
            return {'social': social,
                    'user': social.user,
                    'new_association': True}

def create_social_user(strategy, details, backend, user=None, *args, **kwargs):
    fields = dict((name, kwargs.get(name, details.get(name)))
                  for name in backend.setting('USER_FIELDS', USER_FIELDS))
    if not fields:
        return

    return {
        'social_user': strategy.create_user(**fields)
    }



@partial
def collect_email(strategy, backend, request, details, *args, **kwargs):
    print("collect_email")
    if backend.name != 'email' and backend.name != 'google-oauth2':
        return
    # session 'local_password' is set by the pipeline infrastructure
    # because it exists in FIELDS_STORED_IN_SESSION
    if backend.name == 'google-oauth2':
        try:
            email = kwargs['uid']
        except:
            return exc.HTTPFound(request.route_url("login"))
    elif backend.name == 'email':
        email = backend.strategy.session_get('email')

    details['email'] = email

    # grab the user object from the database (remember that they may
    # not be logged in yet) and set their email.  (Assumes that the
    # email address was captured in an earlier step.)
    try:
        user = DBSession.query(User).filter_by(email=email).one()
        is_new = False
    except NoResultFound:
        is_new = True
#        user = User(email=email, username=email)
#        DBSession.add(user)
#        DBSession.flush()
    # continue the pipeline
    return {'is_new': is_new}

@partial
def collect_password(strategy, backend, request, details, *args, **kwargs):
    print("collect_password")
    if backend.name != 'email':
        return
    # session 'local_password' is set by the pipeline infrastructure
    # because it exists in FIELDS_STORED_IN_SESSION
    email = details['email']
    data = backend.strategy.request_data()
    try:
        details['password'] = data['password']
    except KeyError:
        return backend.strategy.redirect(
            backend.strategy.setting('PASSWORD_FORM_URL')
        )

    # grab the user object from the database (remember that they may
    # not be logged in yet) and set their email.  (Assumes that the
    # email address was captured in an earlier step.)
    try:
        user = DBSession.query(User).filter_by(email=email).one()
        is_new = False
    except NoResultFound:
        is_new = True

#        user = User(email=email, username=email)
#        DBSession.add(user)
#        DBSession.flush()
    # continue the pipeline
    return {'is_new': is_new}


@partial
def store_backend(strategy, backend, request, details, *args, **kwargs):
    strategy.session_set('backend_name', backend.name)
    return

def login_user(backend, user, user_social_auth):
    print("setting user_id in session to "+str(user.id))
    backend.strategy.session_set('user_id', user.id)

def logout_user(request):
    if 'user_id' in request.session:
        request.session.pop('user_id')
    if '_fresh' in request.session:
        request.session.pop('_fresh')
    return(None)


def login_required(request):
    return getattr(request, 'user', None) is not None

def validate_password(strategy, backend, user, is_new=False, *args, **kwargs):
    if backend.name != 'email':
        return

    password = backend.strategy.session_get('local_password', None)
#    if is_new:
#        user.set_password(password)
#        user.save()
#    elif not user.validate_password(password):
    if not user.validate_password(password):
        # return {'user': None, 'social': None}
        raise AuthForbidden(backend, "Email or password not valid")

def get_user(request):
    print(request.session)
    user_id = request.session.get('user_id')
    print(user_id)
    if user_id:
        user = DBSession.query(User) \
                        .filter(User.id == user_id) \
                        .first()
    else:
        user = None
    return user


#@subscriber(BeforeRender)
#def add_social(event):
#    request = event['request']
#    event['social'] = backends(request, request.user)
@partial
def mail_validation(backend, details, is_new=False, is_validated=False, *args, **kwargs):
    print("mail_validation")
    requires_validation = backend.REQUIRES_EMAIL_VALIDATION or \
                          backend.setting('FORCE_EMAIL_VALIDATION', False)
    print(backend.setting)
    send_validation = details.get('email') and not is_validated and \
                      (is_new or backend.setting('PASSWORDLESS', False))
    email = details.get('email')
    print(requires_validation)
    print(send_validation)
    if requires_validation and send_validation:
        data = backend.strategy.request_data()
        if 'verification_code' in data:
            backend.strategy.session_pop('email_validation_address')
            if not backend.strategy.validate_email(details['email'],
                                                   data['verification_code']):
                raise InvalidEmail(backend)
        else:
            current_partial = kwargs.get('current_partial')
            print(backend.strategy.storage.code)
            backend.strategy.storage.code.make_code(email)
            backend.strategy.send_email_validation(backend,
                                                   details['email'],
                                                   current_partial.token)
            backend.strategy.session_set('email_validation_address',
                                         details['email'])
            return backend.strategy.redirect(
                backend.strategy.setting('EMAIL_VALIDATION_URL')
            )
