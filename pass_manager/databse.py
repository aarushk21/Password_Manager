# password_manager/database.py
import sqlite3
from .encryption import PasswordEncryptor

class PasswordDatabase:
    def __init__(self, db_path='password_vault.db'):
        self.db_path = db_path
        self._create_database()

    def _create_database(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS passwords (
                    service TEXT PRIMARY KEY,
                    username TEXT,
                    encrypted_password TEXT
                )
            ''')
            conn.commit()

    def add_password(self, master_key, service, username, password):
        
        encrypted_password = PasswordEncryptor.encrypt(master_key, password)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO passwords (service, username, encrypted_password)
                VALUES (?, ?, ?)
            ''', (service, username, encrypted_password))
            conn.commit()

    def get_password(self, master_key, service):
       
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT username, encrypted_password FROM passwords WHERE service = ?', (service,))
            result = cursor.fetchone()
        
        if result:
            username, encrypted_password = result
            decrypted_password = PasswordEncryptor.decrypt(master_key, encrypted_password)
            return {'username': username, 'password': decrypted_password}
        return None

    def list_services(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT service FROM passwords')
            return [row[0] for row in cursor.fetchall()]

    def delete_password(self, service):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM passwords WHERE service = ?', (service,))
            conn.commit()