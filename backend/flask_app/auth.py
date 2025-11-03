from flask import Blueprint, request, jsonify
from flask_app.db import db
from flask_app.models import User
import jwt
import datetime
# Werkzeug kütüphanesinden hash fonksiyonlarını import ediyoruz
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)
SECRET = "secret123"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "User exists"}), 400

    # Parolayı hash'liyoruz
    hashed_password = generate_password_hash(data["password"], method='pbkdf2:sha256')

    # Veritabanına kullanıcı adı ve hash'lenmiş parolayı kaydediyoruz
    user = User(username=data["username"], password=hashed_password)

    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    # Önce kullanıcı var mı diye, sonra da hash'lenmiş parolalar eşleşiyor mu diye kontrol ediyoruz
    if user and check_password_hash(user.password, data["password"]):
        token = jwt.encode({
            "id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET, algorithm="HS256")
        return jsonify({"token": token})

    return jsonify({"error": "Invalid credentials"}), 401
