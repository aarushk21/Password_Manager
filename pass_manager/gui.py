# password_manager/gui.py
import tkinter as tk
from tkinter import messagebox, simpledialog, ttk
import pyperclip

class PasswordManagerGUI:
    def __init__(self, master, app_controller):
        self.master = master
        self.app_controller = app_controller
        
        master.title("Secure Password Manager")
        master.geometry("600x500")
        master.configure(bg='#f0f0f0')

        # Start with login screen
        self.login_screen()

    def login_screen(self):
        # Clear existing widgets
        for widget in self.master.winfo_children():
            widget.destroy()

        # Login frame
        login_frame = tk.Frame(self.master, bg='#f0f0f0')
        login_frame.pack(expand=True, fill='both', padx=20, pady=20)

        # Title
        title_label = tk.Label(login_frame, text="Password Manager", 
                                font=('Helvetica', 18, 'bold'), 
                                bg='#f0f0f0', fg='#333333')
        title_label.pack(pady=(20, 10))

        # Master Password Entry
        password_label = tk.Label(login_frame, text="Enter Master Password", 
                                  font=('Helvetica', 12), 
                                  bg='#f0f0f0')
        password_label.pack(pady=(10, 5))

        self.master_password_entry = tk.Entry(login_frame, show="*", 
                                              font=('Helvetica', 12), 
                                              width=30)
        self.master_password_entry.pack(pady=5)
        self.master_password_entry.bind('<Return>', self.authenticate)

        # Login Button
        login_button = tk.Button(login_frame, text="Login", 
                                 command=self.authenticate, 
                                 font=('Helvetica', 12), 
                                 bg='#4CAF50', fg='white')
        login_button.pack(pady=10)

        # New User Button
        new_user_button = tk.Button(login_frame, text="Create New Master Password", 
                                    command=self.create_master_password, 
                                    font=('Helvetica', 12), 
                                    bg='#2196F3', fg='white')
        new_user_button.pack(pady=5)

    def create_master_password(self):
        new_master = simpledialog.askstring("New Master Password", 
                                            "Create a strong master password:", 
                                            show='*')
        confirm_master = simpledialog.askstring("Confirm Master Password", 
                                                "Confirm your master password:", 
                                                show='*')
        
        if new_master and confirm_master and new_master == confirm_master:
            try:
                # Initialize app with new master password
                self.app_controller.create_master_password(new_master)
                self.main_screen()
            except Exception as e:
                messagebox.showerror("Error", f"Could not create master password: {str(e)}")
        else:
            messagebox.showerror("Error", "Passwords do not match or were empty.")

    def authenticate(self, event=None):
        master_pass = self.master_password_entry.get()
        try:
            # Validate master password
            self.app_controller.authenticate(master_pass)
            self.main_screen()
        except Exception:
            messagebox.showerror("Authentication Failed", "Incorrect Master Password")

    def main_screen(self):
        # Clear login screen
        for widget in self.master.winfo_children():
            widget.destroy()

        # Main frame
        main_frame = tk.Frame(self.master, bg='#f0f0f0')
        main_frame.pack(expand=True, fill='both', padx=20, pady=20)

        # Title
        title_label = tk.Label(main_frame, text="Password Vault", 
                                font=('Helvetica', 18, 'bold'), 
                                bg='#f0f0f0', fg='#333333')
        title_label.pack(pady=(10, 20))

        pass

   