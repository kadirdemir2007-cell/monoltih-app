from flask import Blueprint, request, jsonify
from flask_app.db import db
from flask_app.models import User
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)
SECRET = "secret123"

# Token Kontrolü (Profil güncelleme için gerekli)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except:
                return jsonify({'message': 'Token formatı hatalı!'}), 401
        if not token:
            return jsonify({'message': 'Token eksik!'}), 401
        try:
            data = jwt.decode(token, SECRET, algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'message': 'Token geçersiz!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Bu kullanıcı adı zaten alınmış."}), 400

    hashed_password = generate_password_hash(data["password"], method='pbkdf2:sha256')
    user = User(username=data["username"], password=hashed_password)
    
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Kullanıcı başarıyla oluşturuldu."}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if user and check_password_hash(user.password, data["password"]):
        token = jwt.encode({
            "id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET, algorithm="HS256")
        return jsonify({
            "token": token,
            "username": user.username,
            "is_admin": user.is_admin
        })
        
    return jsonify({"error": "Kullanıcı adı veya şifre hatalı."}), 401

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    username = data.get("username")
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Kullanıcı bulunamadı"}), 404

    reset_token = jwt.encode({
        "reset_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }, SECRET, algorithm="HS256")

    print(f"\n--- ŞİFRE SIFIRLAMA LİNKİ ---\nhttp://localhost:3000/reset-password/{reset_token}\n-------------------------------\n")
    return jsonify({"message": "Sıfırlama linki gönderildi."}), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("new_password")

    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        user = User.query.get(data.get("reset_id"))
        if not user:
            return jsonify({"error": "Kullanıcı bulunamadı"}), 404
            
        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        db.session.commit()
        return jsonify({"message": "Şifreniz güncellendi."}), 200
    except:
        return jsonify({"error": "Link geçersiz veya süresi dolmuş."}), 400

# YENİ: Profil Güncelleme Endpoint'i
@auth_bp.route("/update", methods=["PUT"])
@token_required
def update_profile(current_user):
    data = request.json
    
    # Kullanıcı adı değişikliği isteniyorsa
    if 'username' in data and data['username'] != current_user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Bu kullanıcı adı zaten kullanımda."}), 400
        current_user.username = data['username']

    # Şifre değişikliği isteniyorsa
    if 'password' in data and data['password']:
        current_user.password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    db.session.commit()
    return jsonify({"message": "Profil bilgileriniz güncellendi."}), 200
