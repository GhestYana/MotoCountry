const FiltersSidebar = ({ filters, setFilters }) => {
  return (
    <aside className="moto-filters-sidebar">
      <h3>Фільтри</h3>

      <div className="filter-group">
        <label>Бренд</label>
        <input
          onChange={(e) =>
            setFilters({ ...filters, brand: e.target.value })
          }
        />
      </div>

      <div className="filter-group">
        <label>Тип</label>
        <input
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
        />
      </div>
    </aside>
  );
};

export default FiltersSidebar;