from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from cryptography.fernet import Fernet
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow requests from the frontend
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///passwords.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

db = SQLAlchemy(app)

# Initialize encryption
encryption_key = os.getenv('ENCRYPTION_KEY', Fernet.generate_key().decode())
print(f"ENCRYPTION_KEY loaded: {encryption_key!r} (length: {len(encryption_key)})")
fernet = Fernet(encryption_key)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    passwords = db.relationship('Password', backref='user', lazy=True)

class Password(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(120), nullable=False)
    encrypted_password = db.Column(db.String(500), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def token_required(f):
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        logger.debug(f"Registration attempt for username: {data.get('username')}")
        
        if not data or 'username' not in data or 'password' not in data:
            logger.error("Missing username or password in request")
            return jsonify({'message': 'Missing username or password'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            logger.error(f"Username already exists: {data['username']}")
            return jsonify({'message': 'Username already exists'}), 400
        
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        new_user = User(username=data['username'], password=hashed_password)
        
        db.session.add(new_user)
        db.session.commit()
        
        logger.info(f"User registered successfully: {data['username']}")
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logger.debug(f"Login attempt for username: {data.get('username')}")
        
        if not data or 'username' not in data or 'password' not in data:
            logger.error("Missing username or password in request")
            return jsonify({'message': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password):
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=1)
            }, app.config['SECRET_KEY'])
            
            logger.info(f"User logged in successfully: {data['username']}")
            return jsonify({'token': token, 'message': 'Login successful'})
        
        logger.warning(f"Invalid login attempt for username: {data.get('username')}")
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@app.route('/passwords', methods=['GET'])
@token_required
def get_passwords(current_user):
    try:
        passwords = Password.query.filter_by(user_id=current_user.id).all()
        return jsonify([{
            'id': p.id,
            'site': p.site,
            'username': p.username,
            'password': fernet.decrypt(p.encrypted_password.encode()).decode(),
            'created_at': p.created_at.isoformat()
        } for p in passwords])
    except Exception as e:
        logger.error(f"Error fetching passwords: {str(e)}")
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@app.route('/passwords', methods=['POST'])
@token_required
def add_password(current_user):
    try:
        data = request.get_json()
        if not data or 'site' not in data or 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Missing required fields'}), 400
        
        encrypted_password = fernet.encrypt(data['password'].encode())
        new_password = Password(
            site=data['site'],
            username=data['username'],
            encrypted_password=encrypted_password.decode(),
            user_id=current_user.id
        )
        
        db.session.add(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password added successfully'}), 201
    except Exception as e:
        logger.error(f"Error adding password: {str(e)}")
        db.session.rollback()
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@app.route('/passwords/<int:id>', methods=['DELETE'])
@token_required
def delete_password(current_user, id):
    try:
        password = Password.query.get_or_404(id)
        
        if password.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        db.session.delete(password)
        db.session.commit()
        
        return jsonify({'message': 'Password deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting password: {str(e)}")
        db.session.rollback()
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)
