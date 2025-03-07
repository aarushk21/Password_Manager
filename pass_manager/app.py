# password_manager/app.py
import tkinter as tk
from .database import PasswordDatabase
from .encryption import PasswordEncryptor
from ..gui import PasswordManagerGUI
from ..utils import generate_strong_password

class PasswordManagerApp:
    def __init__(self, master):
        # Initialize app
        self.master = master
        self.master_key = None
        self.database = PasswordDatabase()
        
        # Create GUI and pass self as controller
        self.gui = PasswordManagerGUI(master, self)

    def create_master_password(self, master_password):
        self.master_key = PasswordEncryptor.generate_key(master_password)

    def authenticate(self, master_password):
        master_key = PasswordEncryptor.generate_key(master_password)
        self.master_key = master_key

    def add_password(self, service, username, password):
        if not self.master_key:
            raise Exception("Not authenticated")
        
        self.database.add_password(self.master_key, service, username, password)

    def get_password(self, service):
        if not self.master_key:
            raise Exception("Not authenticated")
        
        return self.database.get_password(self.master_key, service)

    def list_services(self):
        """
        List all stored services.
        
        Returns:
            list: Services in the password vault
        """
        return self.database.list_services()

    def delete_password(self, service):
        self.database.delete_password(service)

    def generate_password(self, length=16):
        return generate_strong_password(length)