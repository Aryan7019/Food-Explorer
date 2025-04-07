import React from "react";

const CategoryFilter = ({ categories = [], selected, onSelect }) => {
  return (
    <div className="mt-5 ml-4 md:ml-0 md:mt-0 flex flex-col items-end">
      <select
        id="category-select"
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-72 p-2 border border-gray-300 rounded-lg bg-white shadow-sm text-gray-800 focus:outline-none focus:ring focus:ring-green-400"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category[0].toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
