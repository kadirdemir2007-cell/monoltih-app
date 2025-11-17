import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Alışveriş Sitesi</h5>
            <p className="small">
              En kaliteli teknolojik ürünleri en uygun fiyata sizlerle buluşturuyoruz. 
              Müşteri memnuniyeti bizim için her şeyden önemlidir.
            </p>
          </div>
          <div className="col-md-3">
            <h6>Hızlı Linkler</h6>
            <ul className="list-unstyled">
              <li><a href="/products" className="text-light text-decoration-none">Ürünler</a></li>
              <li><a href="/about" className="text-light text-decoration-none">Hakkımızda</a></li>
              <li><a href="/profile" className="text-light text-decoration-none">Profilim</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6>İletişim</h6>
            <p className="small mb-1">Email: info@alisveris.com</p>
            <p className="small">Tel: +90 555 123 45 67</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <div className="text-center small">
          &copy; 2025 Tüm Hakları Saklıdır.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
