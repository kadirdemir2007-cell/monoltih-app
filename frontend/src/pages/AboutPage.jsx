import React from 'react';

function AboutPage() {
  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h1 className="display-4 fw-bold mb-4">Biz Kimiz?</h1>
          <p className="lead">
            Teknoloji tutkunları için kurulan platformumuz, en yeni ürünleri en güvenilir şekilde sizlere ulaştırmayı hedefliyor.
          </p>
          <p>
            2025 yılında kurulan şirketimiz, müşteri odaklı yaklaşımı ve geniş ürün yelpazesiyle e-ticaret sektöründe fark yaratmayı amaçlıyor. 
            MSI, Apple, Logitech gibi dünya devlerinin ürünlerini yetkili satıcı güvencesiyle sunuyoruz.
          </p>
          <button className="btn btn-primary btn-lg mt-3">İletişime Geç</button>
        </div>
        <div className="col-md-6">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
            alt="Ofisimiz" 
            className="img-fluid rounded shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
