from flask import Flask
from flask_cors import CORS
from flask_app.db import db
from flask_app.models import Product, User, Order
from flask_app.auth import auth_bp
from flask_app.products import products_bp
from flask_app.payment import payment_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////app/db.sqlite3" 
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})

db.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(payment_bp, url_prefix="/api/payment")

with app.app_context():
    db.create_all()
    
    if not Product.query.first():
        print("Veritabanına özel ürünler ekleniyor...")
        
        products = [
            Product(
                name='MSI Cyborg 15', 
                price=45000.0, 
                stock=5, 
                category='Bilgisayar',
                image_url='https://productimages.hepsiburada.net/s/777/960-1280/110000709566260.jpg',
                additional_images='https://productimages.hepsiburada.net/s/777/960-1280/110000709520212.jpg,https://productimages.hepsiburada.net/s/777/960-1280/110000709520211.jpg',
                description='Intel i7, RTX 4050, 16GB RAM. Yüksek performanslı oyuncu laptopu.'
            ),
            Product(
                name='Apple MacBook Air M2', 
                price=39000.0, 
                stock=10, 
                category='Bilgisayar',
                image_url='https://productimages.hepsiburada.net/s/777/960-1280/110000805733076.jpg',
                additional_images='https://productimages.hepsiburada.net/s/777/960-1280/110000805733080.jpg,https://productimages.hepsiburada.net/s/777/960-1280/110000805733077.jpg',
                description='M2 çipli, 13.6 inç Liquid Retina ekran, inanılmaz ince ve hafif tasarım.'
            ),
            Product(
                name='Logitech MX Master 3S', 
                price=3500.0, 
                stock=15, 
                category='Aksesuar',
                image_url='https://productimages.hepsiburada.net/s/777/424-600/110000966192640.jpg/format:webp',
                additional_images='https://productimages.hepsiburada.net/s/777/960-1280/110000966192644.jpg,https://productimages.hepsiburada.net/s/777/960-1280/110000966192649.jpg',
                description='Ergonomik tasarım, ultra hızlı kaydırma ve 8K DPI sensör.'
            ),
            Product(
                name='Razer BlackWidow V3', 
                price=4200.0, 
                stock=0, 
                category='Aksesuar',
                image_url='https://productimages.hepsiburada.net/s/483/960-1280/110000528186076.jpg',
                additional_images='https://productimages.hepsiburada.net/s/85/960-1280/110000028029472.jpg,https://productimages.hepsiburada.net/s/85/960-1280/110000028029474.jpg',
                description='Mekanik switchler, RGB aydınlatma ve dayanıklı yapı. (STOK TÜKENDİ)'
            ),
            Product(
                name='Asus TUF Gaming 27"', 
                price=8500.0, 
                stock=8, 
                category='Monitör',
                image_url='https://productimages.hepsiburada.net/s/777/960-1280/110001103239743.jpg',
                additional_images='https://productimages.hepsiburada.net/s/777/960-1280/110001103239746.jpg,https://productimages.hepsiburada.net/s/777/960-1280/110001103239747.jpg',
                description='27 inç, 170Hz, 1ms tepki süresi, IPS panel oyuncu monitörü.'
            ),
            Product(
                name='Sony WH-1000XM5', 
                price=12000.0, 
                stock=3, 
                category='Ses',
                image_url='https://productimages.hepsiburada.net/s/777/960-1280/110000672446532.jpg',
                additional_images='https://productimages.hepsiburada.net/s/777/960-1280/110000672446529.jpg,https://productimages.hepsiburada.net/s/777/960-1280/110000672446530.jpg',
                description='Sektör lideri gürültü engelleme ve üstün ses kalitesi.'
            )
        ]
        
        db.session.add_all(products)
        db.session.commit()
        print("Ürünler başarıyla eklendi.")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
