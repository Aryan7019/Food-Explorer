import React, { useState } from "react";

const Sort = ({ onSort }) => {
   const [sortOption, setSortOption] = useState("");

   const handleSortChange = (e) => {
      const selectedOption = e.target.value;
      setSortOption(selectedOption);
      onSort(selectedOption);
   };

   return (
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
         <label className="text-gray-700 font-semibold">Sort by:</label>
         <select
            value={sortOption}
            onChange={handleSortChange}
            className="px-4 py-2 border rounded-lg text-gray-600 focus:ring focus:ring-green-300"
         >
            <option value="">Select</option>
            <option value="name-asc">Product Name (A-Z)</option>
            <option value="name-desc">Product Name (Z-A)</option>
            <option value="grade-asc">Nutrition Grade (Ascending)</option>
            <option value="grade-desc">Nutrition Grade (Descending)</option>
         </select>
      </div>
   );
};

export default Sort;
