# flask_sqlalchemy'den yeni db yaratmıyoruz, var olanı import ediyoruz:
from flask_app.db import db 
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(100))
    # Kullanıcının yorumlarına ulaşabilmek için ilişki
    reviews = db.relationship('Review', backref='user', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.Float)
    image_url = db.Column(db.String(255))
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    stock = db.Column(db.Integer, default=10)
    additional_images = db.Column(db.Text)
    # Ürünün yorumlarına ulaşabilmek için ilişki
    reviews = db.relationship('Review', backref='product', lazy=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Hazırlanıyor')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Hangi kullanıcı yazdı?
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Hangi ürüne yazıldı?
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
