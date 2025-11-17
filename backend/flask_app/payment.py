from flask import Blueprint, request, jsonify
from flask_app.db import db
from flask_app.models import Order, User
import jwt
from functools import wraps
from datetime import datetime

payment_bp = Blueprint("payment", __name__)
SECRET = "secret123"

# Token kontrolcüsü (Kullanıcıyı tanımak için)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Header'dan token'ı al
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token formatı geçersiz!'}), 401
        
        if not token:
            return jsonify({'message': 'Token eksik!'}), 401
        
        try:
            # Token'ı çöz ve kullanıcıyı bul
            data = jwt.decode(token, SECRET, algorithms=["HS256"])
            current_user = User.query.get(data['id'])
            if not current_user:
                return jsonify({'message': 'Kullanıcı bulunamadı!'}), 401
        except:
            return jsonify({'message': 'Token geçersiz!'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Ödeme Yapma ve Sipariş Kaydetme Endpoint'i
@payment_bp.route("/", methods=["POST"])
@token_required
def pay(current_user):
    data = request.json
    amount = data.get("amount")

    if not amount:
         return jsonify({"error": "Tutar belirtilmedi"}), 400

    # Yeni siparişi oluştur
    new_order = Order(
        user_id=current_user.id, 
        total_amount=amount, 
        status="Tamamlandı"
    )
    
    # Veritabanına kaydet
    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        "status": "success", 
        "paid": amount, 
        "message": "Siparişiniz başarıyla alındı ve kaydedildi."
    })

# Sipariş Geçmişini Getirme Endpoint'i
@payment_bp.route("/history", methods=["GET"])
@token_required
def get_order_history(current_user):
    # Kullanıcının siparişlerini tarihe göre tersten sıralayarak (en yeni en üstte) getir
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    
    output = []
    for order in orders:
        order_data = {
            'id': order.id,
            'total_amount': order.total_amount,
            'status': order.status,
            'date': order.created_at.strftime('%d.%m.%Y %H:%M') # Tarih formatı: Gün.Ay.Yıl Saat:Dakika
        }
        output.append(order_data)
    
    return jsonify(output)
