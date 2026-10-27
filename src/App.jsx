import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrandsByNumber, fetchOffersAndAnalogues, setSearchNumber } from './store/partsSlice';

function App() {
  const dispatch = useDispatch();
  const { searchNumber, brands, offers, loading, error } = useSelector((state) => state.parts);

  const [inputNumber, setInputNumber] = useState(searchNumber);
  const [activeBrand, setActiveBrand] = useState('');

  const handleSearchNumber = (e) => {
    e.preventDefault();

    const clearSearchNumber = inputNumber.trim();

    if (!clearSearchNumber) {
      return;
    }

    setActiveBrand('');
    dispatch(setSearchNumber(clearSearchNumber));
    dispatch(fetchBrandsByNumber(clearSearchNumber));
  };

  const handleSelectBrand = (brand) => {
    setActiveBrand(brand);
    dispatch(fetchOffersAndAnalogues({ number: searchNumber, brand }));
  };

  return (
      <div className="container my-5" style={{ maxWidth: '1000px' }}>
        <h2 className="text-center mb-4 text-primary">Подбор автозапчастей и аналогов</h2>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSearchNumber} className="row g-3 align-items-center">
              <div className="col-md-8">
                <label htmlFor="partNumber" className="form-label fw-bold">Введите артикул детали</label>
                <input
                    type="text"
                    id="partNumber"
                    className="form-control form-control-lg"
                    placeholder="Например: 7160500039S или 01089"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                />
              </div>
              <div className="col-md-4 d-grid align-self-end">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  Найти производителей
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
            <div className="alert alert-warning shadow-sm" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
        )}

        {brands.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-light fw-bold text-secondary">
                Выберите производителя для поиска цен и аналогов
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {brands.map((brand) => (
                      <button
                          key={brand}
                          type="button"
                          className={`btn ${activeBrand === brand ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => handleSelectBrand(brand)}
                      >
                        {brand}
                      </button>
                  ))}
                </div>
              </div>
            </div>
        )}

        {offers.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white fw-bold">
                Найденные предложения и аналоги для бренда "{activeBrand}"
              </div>
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0 align-middle">
                  <thead className="table-dark">
                  <tr>
                    <th scope="col">Название / Производитель</th>
                    <th scope="col" className="text-center">Стоимость (цена)</th>
                    <th scope="col" className="text-end">Доступный остаток на складе</th>
                  </tr>
                  </thead>
                  <tbody>
                  {offers.map((offer) => (
                      <tr key={offer.id}>
                        <td>
                          <div className="fw-bold">{offer.name} / {offer.brand}</div>
                        </td>
                        <td className="text-center fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                          {offer.price > 0 ? `${offer.price.toFixed(2)} ₽` : '—'}
                        </td>
                        <td className="text-end">
                          {offer.stock} шт.
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {loading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status" style={{ width: '20px', height: '20px' }}>
                <span className="visually-hidden">Загрузка данных...</span>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
