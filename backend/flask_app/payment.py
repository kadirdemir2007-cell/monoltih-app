from flask import Blueprint, request, jsonify

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/", methods=["POST"])
def pay():
    data = request.json
    amount = data.get("amount")
    return jsonify({"status": "success", "paid": amount})
