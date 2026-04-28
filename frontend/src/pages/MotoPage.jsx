import React, { useState, useEffect } from "react";
import MotorcycleCard from "../components/MotorcycleCard";
import "../styles/MotoPage.css";

const MotoPage = () => {
  const [motorcycles, setMotorcycles] = useState([]);

  const [filters, setFilters] = useState({
    brand: '',
    type: '',
    color: '',
    year: '',
    minPrice: '',
    maxPrice: '',
    sort: ''
  });

  const fetchMotorcycles = async () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );

    const params = new URLSearchParams(cleanFilters).toString();

    const res = await fetch(`/api/motorcycles?${params}`);
    const data = await res.json();

    setMotorcycles(data);
  };

  useEffect(() => {
    fetchMotorcycles();
  }, [filters]);

  return (
    <div className="moto-page-container">

      {/* SIDEBAR */}
      <aside className="moto-filters-sidebar">
        <h3>Фільтри</h3>

        {/* СОРТИРОВКА */}
        <div className="filter-group">
          <label>Сортування</label>
          <select
            onChange={(e) =>

              setFilters({ ...filters, sort: e.target.value })

            }
          >
            <option value="">За замовчуванням</option>
            <option value="price_asc">Ціна ↑</option>
            <option value="price_desc">Ціна ↓</option>
            <option value="volume_asc">Обʼєм ↑</option>
            <option value="volume_desc">Обʼєм ↓</option>
            <option value="year_desc">Новіші</option>
            <option value="year_asc">Старіші</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Бренд</label>
          <input
            placeholder="Honda"
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Тип</label>
          <input
            placeholder="Спортбайк"
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Колір</label>
          <input
            placeholder="Чорний"
            onChange={(e) => setFilters({ ...filters, color: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Мін. ціна</label>
          <input
            type="number"
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Макс. ціна</label>
          <input
            type="number"
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </aside>

      {/* СПИСОК */}
      <main className="moto-list-main">
        <h2>Мотоцикли</h2>
        <p>Знайдено: {motorcycles.length}</p>

        <div className="moto-grid">
          {motorcycles.map((moto) => (
            <MotorcycleCard
              key={moto.id}
              image={moto.image || 'https://bikes.honda.ua/images/models/CB650R.png'}
              type={moto.type}
              model={`${moto.brand || ''} ${moto.name || ''}`}
              price={`${moto.price} грн`}
              volume={`${moto.engine_displacement || '-'} см³`}
            />
          ))}
        </div>
      </main>

    </div>
  );
};

export default MotoPage;