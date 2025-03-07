# password_manager/utils.py
import secrets
import string

def generate_strong_password(length=16):
    # Use a mix of uppercase, lowercase, digits, and punctuation
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))