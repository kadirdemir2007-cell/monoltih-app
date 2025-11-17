from flask import Blueprint, request, jsonify
from flask_app.db import db
from flask_app.models import Order, User
import jwt
from functools import wraps
from datetime import datetime

payment_bp = Blueprint("payment", __name__)
SECRET = "secret123"

# --- DECORATORS ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token formatı geçersiz!'}), 401
        
        if not token:
            return jsonify({'message': 'Token eksik!'}), 401
        
        try:
            data = jwt.decode(token, SECRET, algorithms=["HS256"])
            current_user = User.query.get(data['id'])
            if not current_user:
                return jsonify({'message': 'Kullanıcı bulunamadı!'}), 401
        except:
            return jsonify({'message': 'Token geçersiz!'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Admin Kontrolü (Buraya da ekliyoruz)
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({'message': 'Bu işlem için yönetici yetkisi gerekiyor!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# --- USER ROUTES ---

@payment_bp.route("/", methods=["POST"])
@token_required
def pay(current_user):
    data = request.json
    amount = data.get("amount")

    if not amount:
         return jsonify({"error": "Tutar belirtilmedi"}), 400

    new_order = Order(
        user_id=current_user.id, 
        total_amount=amount, 
        status="Hazırlanıyor" # Varsayılan durum
    )
    
    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        "status": "success", 
        "paid": amount, 
        "message": "Siparişiniz başarıyla alındı."
    })

@payment_bp.route("/history", methods=["GET"])
@token_required
def get_order_history(current_user):
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    output = []
    for order in orders:
        output.append({
            'id': order.id,
            'total_amount': order.total_amount,
            'status': order.status,
            'date': order.created_at.strftime('%d.%m.%Y %H:%M')
        })
    return jsonify(output)

# --- ADMIN ROUTES (YENİ) ---

# Tüm Siparişleri Listele (Sadece Admin)
@payment_bp.route("/all-orders", methods=["GET"])
@token_required
@admin_required
def get_all_orders(current_user):
    orders = Order.query.order_by(Order.created_at.desc()).all()
    output = []
    for order in orders:
        # Siparişi veren kullanıcının adını da bulalım
        user = User.query.get(order.user_id)
        username = user.username if user else "Bilinmiyor"
        
        output.append({
            'id': order.id,
            'username': username,
            'total_amount': order.total_amount,
            'status': order.status,
            'date': order.created_at.strftime('%d.%m.%Y %H:%M')
        })
    return jsonify(output)

# Sipariş Durumunu Güncelle (Sadece Admin)
@payment_bp.route("/order/<int:order_id>", methods=["PUT"])
@token_required
@admin_required
def update_order_status(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    data = request.json
    new_status = data.get('status')
    
    if new_status:
        order.status = new_status
        db.session.commit()
        return jsonify({'message': f'Sipariş durumu "{new_status}" olarak güncellendi.'})
    
    return jsonify({'error': 'Durum belirtilmedi'}), 400
