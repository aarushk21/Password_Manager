# password_manager/encryption.py
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class PasswordEncryptor:
    @staticmethod
    def generate_key(master_password):
        """
        Generate a secure encryption key from the master password.
        
        Args:
            master_password (str): Master password used to derive encryption key
        
        Returns:
            bytes: Encryption key
        """
        salt = b'secure_salt_for_key_derivation'  # In a real app, generate a unique salt per user
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000
        )
        return base64.urlsafe_b64encode(kdf.derive(master_password.encode()))

    @staticmethod
    def encrypt(key, data):
        """
        Encrypt data using Fernet encryption.
        
        Args:
            key (bytes): Encryption key
            data (str): Data to encrypt
        
        Returns:
            str: Encrypted data
        """
        cipher_suite = Fernet(key)
        return cipher_suite.encrypt(data.encode()).decode()

    @staticmethod
    def decrypt(key, encrypted_data):
        """
        Decrypt data using Fernet encryption.
        
        Args:
            key (bytes): Decryption key
            encrypted_data (str): Encrypted data to decrypt
        
        Returns:
            str: Decrypted data
        """
        cipher_suite = Fernet(key)
        return cipher_suite.decrypt(encrypted_data.encode()).decode()