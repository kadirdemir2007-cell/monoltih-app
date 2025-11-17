from flask import Blueprint, jsonify, request
from functools import wraps
import jwt
from flask_app.models import Product, Review, User
from flask_app.db import db
from datetime import datetime

products_bp = Blueprint("products", __name__)
SECRET = "secret123" 

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
            # Kullanıcı bilgisini de fonksiyona gönderiyoruz (Yorum yapmak için lazım)
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'message': 'Token geçersiz veya süresi dolmuş!'}), 401
        
        return f(current_user, *args, **kwargs)

    return decorated

@products_bp.route("/", methods=["GET"])
@token_required 
def get_products(current_user):
    products = Product.query.all()
    return jsonify([{
        "id": p.id, 
        "name": p.name, 
        "price": p.price, 
        "image_url": p.image_url, 
        "description": p.description,
        "category": p.category,
        "stock": p.stock
    } for p in products])

@products_bp.route("/<int:product_id>", methods=["GET"])
@token_required 
def get_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    
    all_images = [product.image_url]
    if product.additional_images:
        all_images.extend(product.additional_images.split(','))
    
    # Ürüne ait yorumları çekiyoruz
    reviews_data = []
    for review in product.reviews:
        reviews_data.append({
            "id": review.id,
            "username": review.user.username, # Yorumu yazan kişinin adı
            "content": review.content,
            "date": review.created_at.strftime('%d.%m.%Y')
        })

    return jsonify({
        "id": product.id, 
        "name": product.name, 
        "price": product.price, 
        "description": product.description,
        "category": product.category,
        "stock": product.stock,
        "images": all_images,
        "reviews": reviews_data # Yorumları da gönderiyoruz
    })

# YENİ ENDPOINT: Yorum Ekleme
@products_bp.route("/<int:product_id>/reviews", methods=["POST"])
@token_required
def add_review(current_user, product_id):
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({'message': 'Yorum boş olamaz!'}), 400
        
    new_review = Review(content=content, user_id=current_user.id, product_id=product_id)
    db.session.add(new_review)
    db.session.commit()
    
    return jsonify({'message': 'Yorum başarıyla eklendi!'}), 201
