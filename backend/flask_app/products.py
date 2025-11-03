from flask import Blueprint, jsonify, request
from functools import wraps
import jwt
from flask_app.models import Product

products_bp = Blueprint("products", __name__)

SECRET = "secret123" 

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token eksik!'}), 401

        try:
            data = jwt.decode(token, SECRET, algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token geçersiz veya süresi dolmuş!'}), 401

        return f(*args, **kwargs)

    return decorated

# Mevcut endpoint (Tüm ürünleri listeler)
@products_bp.route("/", methods=["GET"])
@token_required 
def get_products():
    products = Product.query.all()
    # "description": p.description kısmını ekledik
    return jsonify([{"id": p.id, "name": p.name, "price": p.price, "image_url": p.image_url, "description": p.description} for p in products])

# YENİ EKLEDİĞİMİZ ENDPOINT (Tek bir ürünü ID'ye göre getirir)
@products_bp.route("/<int:product_id>", methods=["GET"])
@token_required 
def get_product(product_id):
    product = Product.query.get_or_404(product_id) 
    return jsonify({
        "id": product.id, 
        "name": product.name, 
        "price": product.price, 
        "image_url": product.image_url,
        "description": product.description # Bu satırı ekledik
    })
