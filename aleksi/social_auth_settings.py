#SOCIAL_AUTH_LOGIN_URL = '/login'
#SOCIAL_AUTH_EMAIL_FORM_URL = '/login_email'
#SOCIAL_AUTH_PASSWORD_FORM_URL = '/set_password'
#SOCIAL_AUTH_EMAIL_VALIDATION_URL = '/email_verify_sent'
SOCIAL_AUTH_USER_MODEL = 'aleksi.models.user.User'
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/'
SOCIAL_AUTH_LOGIN_FUNCTION = 'aleksi.auth.login_user'
SOCIAL_AUTH_LOGGEDIN_FUNCTION = 'aleksi.auth.login_required'
SOCIAL_AUTH_EMAIL_FORM_HTML = ''
SOCIAL_AUTH_EMAIL_VALIDATION_FUNCTION = 'aleksi.auth.send_validation_email'
SOCIAL_AUTH_EMAIL_FORCE_EMAIL_VALIDATION = True
SESSION_SERIALIZER='pyramid.session.PickleSerializer'
#SESSION_SERIALIZER='django.contrib.sessions.serializers.PickleSerializer'

#SOCIAL_AUTH_FIELDS_STORED_IN_SESSION = ['local_password',]
SOCIAL_AUTH_FIELDS_STORED_IN_SESSION = []
SOCIAL_AUTH_GOOGLE_OAUTH2_AUTH_EXTRA_ARGUMENTS = {
    'access_type': 'offline',
    'prompt': 'select_account'
}

SOCIAL_AUTH_AUTHENTICATION_BACKENDS = (
    'social_core.backends.quizlet.QuizletOAuth2',
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.email.EmailAuth',
)

SOCIAL_AUTH_TRAILING_SLASH = True

SOCIAL_AUTH_PIPELINE = (
    'aleksi.auth.save_next',
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'aleksi.auth.collect_email',
##    'aleksi.auth.no_new_users',
    'aleksi.auth.mail_validation',
    'social_core.pipeline.social_auth.social_user', #
##    'aleksi.auth.create_social_user',
    'social_core.pipeline.user.get_username',
    'aleksi.auth.collect_password',
    'aleksi.auth.create_user',
    'aleksi.auth.validate_password',
    'aleksi.auth.disassociate_social_user',
##    'aleksi.auth.social_user',
##    'social_core.pipeline.social_auth.social_user',
##    'common.pipeline.require_email',
##    'social_core.pipeline.user.create_user',
    'aleksi.auth.store_backend',
    'aleksi.auth.associate_user',
##    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.debug.debug',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
    'social_core.pipeline.debug.debug'
)
