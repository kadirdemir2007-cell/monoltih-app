from flask import Blueprint, jsonify, request
from functools import wraps
import jwt
# Wishlist modelini de import ediyoruz
from flask_app.models import Product, Review, User, Wishlist
from flask_app.db import db

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
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'message': 'Token geçersiz veya süresi dolmuş!'}), 401
        
        return f(current_user, *args, **kwargs)

    return decorated

# Tüm Ürünleri Listeleme (Favori bilgisiyle beraber)
@products_bp.route("/", methods=["GET"])
@token_required 
def get_products(current_user):
    products = Product.query.all()
    output = []
    for p in products:
        # Kullanıcı bu ürünü favorilemiş mi kontrol et
        fav = Wishlist.query.filter_by(user_id=current_user.id, product_id=p.id).first()
        is_favorite = True if fav else False

        output.append({
            "id": p.id, 
            "name": p.name, 
            "price": p.price, 
            "image_url": p.image_url, 
            "description": p.description,
            "category": p.category,
            "stock": p.stock,
            "is_favorite": is_favorite # Bu bilgi frontend için önemli
        })
    return jsonify(output)

# Tek Ürün Detayı
@products_bp.route("/<int:product_id>", methods=["GET"])
@token_required 
def get_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    
    all_images = [product.image_url]
    if product.additional_images:
        all_images.extend(product.additional_images.split(','))
    
    reviews_data = []
    total_rating = 0
    for review in product.reviews:
        reviews_data.append({
            "id": review.id,
            "username": review.user.username,
            "content": review.content,
            "rating": review.rating,
            "date": review.created_at.strftime('%d.%m.%Y')
        })
        total_rating += review.rating

    avg_rating = 0
    if len(product.reviews) > 0:
        avg_rating = round(total_rating / len(product.reviews), 1)

    # Detay sayfasında da favori durumunu kontrol et
    fav = Wishlist.query.filter_by(user_id=current_user.id, product_id=product.id).first()
    is_favorite = True if fav else False

    return jsonify({
        "id": product.id, 
        "name": product.name, 
        "price": product.price, 
        "description": product.description,
        "category": product.category,
        "stock": product.stock,
        "images": all_images,
        "reviews": reviews_data,
        "avg_rating": avg_rating,
        "is_favorite": is_favorite
    })

# Yorum Ekleme
@products_bp.route("/<int:product_id>/reviews", methods=["POST"])
@token_required
def add_review(current_user, product_id):
    data = request.json
    content = data.get('content')
    rating = data.get('rating', 5)
    
    if not content:
        return jsonify({'message': 'Yorum boş olamaz!'}), 400
        
    new_review = Review(content=content, rating=rating, user_id=current_user.id, product_id=product_id)
    db.session.add(new_review)
    db.session.commit()
    
    return jsonify({'message': 'Yorum ve puan başarıyla eklendi!'}), 201

# YENİ: Favori Ekle/Çıkar (Toggle)
@products_bp.route("/<int:product_id>/favorite", methods=["POST"])
@token_required
def toggle_favorite(current_user, product_id):
    # Önce favorilerde var mı diye bak
    existing_wish = Wishlist.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    
    if existing_wish:
        # Varsa sil (Favoriden çıkar)
        db.session.delete(existing_wish)
        db.session.commit()
        return jsonify({'message': 'Favorilerden çıkarıldı.', 'is_favorite': False})
    else:
        # Yoksa ekle
        new_wish = Wishlist(user_id=current_user.id, product_id=product_id)
        db.session.add(new_wish)
        db.session.commit()
        return jsonify({'message': 'Favorilere eklendi.', 'is_favorite': True})

# YENİ: Kullanıcının Favorilerini Listele
@products_bp.route("/favorites", methods=["GET"])
@token_required
def get_favorites(current_user):
    # Wishlist tablosundan kullanıcının eklediği ürünleri buluyoruz
    # Join işlemi ile Product tablosundaki detayları çekiyoruz
    favorites = db.session.query(Product).join(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    
    output = []
    for p in favorites:
        output.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "image_url": p.image_url,
            "category": p.category
        })
    
    return jsonify(output)
