from flask import Blueprint, jsonify, request
from functools import wraps
import jwt
from flask_app.models import Product, Review, User, Wishlist
from flask_app.db import db

products_bp = Blueprint("products", __name__)
SECRET = "secret123" 

# --- DECORATORS ---

# 1. Token Kontrolü (Giriş yapmış mı?)
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

# 2. Admin Kontrolü (Yönetici mi?) - YENİ EKLENDİ
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({'message': 'Bu işlem için yönetici yetkisi gerekiyor!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# --- PUBLIC & USER ROUTES ---

@products_bp.route("/", methods=["GET"])
@token_required 
def get_products(current_user):
    products = Product.query.all()
    output = []
    for p in products:
        fav = Wishlist.query.filter_by(user_id=current_user.id, product_id=p.id).first()
        is_favorite = True if fav else False
        output.append({
            "id": p.id, "name": p.name, "price": p.price, 
            "image_url": p.image_url, "description": p.description,
            "category": p.category, "stock": p.stock, "is_favorite": is_favorite
        })
    return jsonify(output)

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
            "id": review.id, "username": review.user.username,
            "content": review.content, "rating": review.rating,
            "date": review.created_at.strftime('%d.%m.%Y')
        })
        total_rating += review.rating
    avg_rating = round(total_rating / len(product.reviews), 1) if len(product.reviews) > 0 else 0
    
    fav = Wishlist.query.filter_by(user_id=current_user.id, product_id=product.id).first()
    is_favorite = True if fav else False

    return jsonify({
        "id": product.id, "name": product.name, "price": product.price, 
        "description": product.description, "category": product.category, 
        "stock": product.stock, "images": all_images, "reviews": reviews_data, 
        "avg_rating": avg_rating, "is_favorite": is_favorite
    })

@products_bp.route("/<int:product_id>/reviews", methods=["POST"])
@token_required
def add_review(current_user, product_id):
    data = request.json
    new_review = Review(content=data.get('content'), rating=data.get('rating', 5), user_id=current_user.id, product_id=product_id)
    db.session.add(new_review)
    db.session.commit()
    return jsonify({'message': 'Yorum eklendi!'}), 201

@products_bp.route("/<int:product_id>/favorite", methods=["POST"])
@token_required
def toggle_favorite(current_user, product_id):
    existing_wish = Wishlist.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    if existing_wish:
        db.session.delete(existing_wish)
        db.session.commit()
        return jsonify({'message': 'Favorilerden çıkarıldı.', 'is_favorite': False})
    else:
        new_wish = Wishlist(user_id=current_user.id, product_id=product_id)
        db.session.add(new_wish)
        db.session.commit()
        return jsonify({'message': 'Favorilere eklendi.', 'is_favorite': True})

@products_bp.route("/favorites", methods=["GET"])
@token_required
def get_favorites(current_user):
    favorites = db.session.query(Product).join(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    return jsonify([{"id": p.id, "name": p.name, "price": p.price, "image_url": p.image_url, "category": p.category} for p in favorites])

# --- ADMIN ROUTES (YENİ EKLENDİ) ---

# 1. Ürün Ekleme
@products_bp.route("/", methods=["POST"])
@token_required
@admin_required
def add_product(current_user):
    data = request.json
    new_product = Product(
        name=data['name'],
        price=float(data['price']),
        image_url=data['image_url'],
        description=data.get('description', ''),
        category=data['category'],
        stock=int(data['stock']),
        additional_images=data.get('additional_images', '')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Ürün başarıyla eklendi!'}), 201

# 2. Ürün Güncelleme
@products_bp.route("/<int:product_id>", methods=["PUT"])
@token_required
@admin_required
def update_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json
    
    product.name = data.get('name', product.name)
    product.price = float(data.get('price', product.price))
    product.image_url = data.get('image_url', product.image_url)
    product.description = data.get('description', product.description)
    product.category = data.get('category', product.category)
    product.stock = int(data.get('stock', product.stock))
    product.additional_images = data.get('additional_images', product.additional_images)
    
    db.session.commit()
    return jsonify({'message': 'Ürün güncellendi!'})

# 3. Ürün Silme
@products_bp.route("/<int:product_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Ürün silindi!'})
