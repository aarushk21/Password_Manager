# Password Manager

A secure, full-stack password management application built with React and Flask. This application allows users to safely store, manage, and organize their passwords with strong encryption.

## Features

- Secure password storage with encryption
- User-friendly interface built with React
- RESTful API backend with Flask
- Password generation capabilities
- Secure database storage
- Environment variable configuration for enhanced security

## Tech Stack

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: SQLite
- **Security**: Python cryptography library

## Setup

### Prerequisites
- Python 3.x
- Node.js and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aarushk21/Password_Manager.git
cd Password_Manager
```

2. Set up the backend:
```bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
SECRET_KEY=your_secure_secret_key_here
DATABASE_URL=sqlite:///passwords.db
ENCRYPTION_KEY=your_secure_encryption_key
```

## Running the Application

1. Start the backend server:
```bash
python app.py
```

2. In a separate terminal, start the frontend:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## Security Features

- AES encryption for password storage
- Environment variable configuration for sensitive data
- Secure password hashing
- HTTPS support for production deployment

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
