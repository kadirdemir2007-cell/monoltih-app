from flask import Flask
from flask_cors import CORS
from flask_app.db import db
from flask_app.models import Product, User 
from flask_app.auth import auth_bp
from flask_app.products import products_bp
from flask_app.payment import payment_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////app/db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# CORS yapılandırması
CORS(app, resources={r"/api/*": {"origins": "*"}})

db.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(payment_bp, url_prefix="/api/payment")

# Veritabanı tablolarını oluştur ve örnek ürünleri ekle
with app.app_context():
    db.create_all()
    # Eğer Product tablosunda hiç ürün yoksa...
    # ...
    if not Product.query.first():
        print("Veritabanına örnek ürünler ekleniyor...")
        # ... (kodun üst kısmı aynı)

with app.app_context():
    db.create_all()
    # Eğer Product tablosunda hiç ürün yoksa...
    if not Product.query.first():
        print("Veritabanına örnek ürünler ekleniyor...")

        # --- LAPTOP RESİM URL'İ GÜNCELLENDİ ---
        p1 = Product(name='MSI Cyborg 15 A13VE', 
                     price=45000.0, 
                     image_url='https://cdn.akakce.com/z/msi/msi-cyborg-15-a13ve-1478xtr-i5-13420h-16-gb-1-tb-ssd-rtx4050-15-6-full-hd-gaming-laptop.jpg', # Gerçek resim URL'i
                     description='15.6" Oyuncu Laptopu - Intel Core i7-13620H, 16GB DDR5 RAM, 1TB NVMe SSD, 6GB NVIDIA RTX 4050 Ekran Kartı, FreeDOS.')
        # ------------------------------------

        p2 = Product(name='Klavye', price=750.0, 
                     image_url='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDDVvNr5YuxELAbsLLTX4SLk-x0-aX6KBZPw&s', # Örnek Klavye Resmi
                     description='RGB aydınlatmalı, dayanıklı mekanik tuşlara sahip profesyonel oyuncu klavyesi. Hızlı tepkime süresiyle rakiplerinizin önüne geçin.')

        # ...
        p3 = Product(name='Mouse', price=400.0, 
                     image_url='https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SL1500_.jpg', # Yeni Mouse Resmi
                     description='Saatlerce konforlu kullanım için tasarlanmış ergonomik kablosuz mouse. Ayarlanabilir DPI hassasiyeti ve programlanabilir tuşlar.')
# ...

        db.session.add_all([p1, p2, p3])
        db.session.commit()

# ... (kodun alt kısmı aynı
# ...

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
