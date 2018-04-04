from social_core.exceptions import AuthForbidden, AuthAlreadyAssociated, AuthCanceled, InvalidEmail

class EmailValidationFailure(Exception):
    pass

class UserAlreadyExists(Exception):
    pass

class EmailAuthForbidden(AuthForbidden):
    pass

