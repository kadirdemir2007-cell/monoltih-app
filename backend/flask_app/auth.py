from flask import Blueprint, request, jsonify
from flask_app.db import db
from flask_app.models import User
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)
SECRET = "secret123"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "User exists"}), 400

    hashed_password = generate_password_hash(data["password"], method='pbkdf2:sha256')
    user = User(username=data["username"], password=hashed_password)
    
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if user and check_password_hash(user.password, data["password"]):
        token = jwt.encode({
            "id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET, algorithm="HS256")
        return jsonify({"token": token})
        
    return jsonify({"error": "Invalid credentials"}), 401

# --- YENİ: Şifremi Unuttum İsteği ---
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    username = data.get("username")
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Kullanıcı bulunamadı"}), 404

    # 15 dakikalık geçici bir token oluşturuyoruz
    reset_token = jwt.encode({
        "reset_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }, SECRET, algorithm="HS256")

    # Gerçek hayatta burada e-posta gönderilir.
    # Biz terminale yazdırıyoruz (Loglardan alıp kullanacağız).
    print(f"\n--- ŞİFRE SIFIRLAMA LİNKİ ---\nhttp://localhost:3000/reset-password/{reset_token}\n-------------------------------\n")
    
    return jsonify({"message": "Sıfırlama linki terminale yazdırıldı (E-posta simülasyonu)."}), 200

# --- YENİ: Şifreyi Sıfırla ---
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("new_password")

    try:
        # Token'ı çöz
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        user_id = data.get("reset_id")
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Kullanıcı bulunamadı"}), 404
            
        # Yeni şifreyi hashle ve kaydet
        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        db.session.commit()
        
        return jsonify({"message": "Şifreniz başarıyla güncellendi."}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Linkin süresi dolmuş."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Geçersiz link."}), 400
