from flask_app.db import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(100))

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.Float)
    image_url = db.Column(db.String(255))
    description = db.Column(db.Text)
    # YENİ EKLENEN ALANLAR
    category = db.Column(db.String(50))
    stock = db.Column(db.Integer, default=10)
    additional_images = db.Column(db.Text)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Hazırlanıyor')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
