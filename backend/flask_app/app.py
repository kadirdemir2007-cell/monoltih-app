from flask import Flask
from flask_cors import CORS
from flask_app.db import db
from flask_app.auth import auth_bp
from flask_app.products import products_bp
from flask_app.payment import payment_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
CORS(app)

db.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(payment_bp, url_prefix="/api/payment")

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")