import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_URL = "https://world.openfoodfacts.org/api/v0/product";

const Product = () => {
   const { id } = useParams();
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchProduct = async () => {
         try {
            const response = await axios.get(`${API_URL}/${id}.json`);
            if (!response.data.product) {
               throw new Error("Product not found");
            }
            setProduct(response.data.product);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchProduct();
   }, [id]);

   if (loading) return <div className="text-center text-xl font-semibold text-gray-700 mt-10">Loading...</div>;
   if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header - Modern Look */}
         <header className="bg-[#3A7D44] text-white py-4 px-6 flex justify-between items-center w-full fixed top-0 left-0 shadow-md z-10">
            <h1 className="text-3xl font-extrabold tracking-wide">Product Details</h1>
            <Link to="/" className="bg-white text-[#3A7D44] px-5 py-2 rounded-lg font-semibold shadow-lg hover:bg-gray-200 transition-all duration-300">
               Home
            </Link>
         </header>

         {/* Spacing below fixed header */}
         <div className="pt-24 px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
               <div className="flex flex-col md:flex-row ">
                  {/* Product Image */}
                  <img
                     src={product.image_url || "https://via.placeholder.com/250"}
                     alt={product.product_name}
                     className="w-56 h-56 object-cover rounded-2xl border shadow-md"
                  />

                  {/* Product Info */}
                  <div className="ml-0 md:ml-8 mt-6 md:mt-0 flex-1">
                     <h2 className="text-4xl font-extrabold text-gray-800">{product.product_name || "Unnamed Product"}</h2>
                     <p className="text-gray-500 text-lg mt-2">Category: <span className="font-semibold">{product.categories || "Unknown"}</span></p>

                     {/* Nutritional Values */}
                     <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Nutritional Values (per 100g)</h3>
                        <ul className="text-gray-600 text-lg space-y-2">
                           <li><strong>Energy:</strong> {product.nutriments["energy-kcal_100g"] || "N/A"} kcal</li>
                           <li><strong>Fat:</strong> {product.nutriments.fat_100g || "N/A"} g</li>
                           <li><strong>Carbs:</strong> {product.nutriments.carbohydrates_100g || "N/A"} g</li>
                           <li><strong>Proteins:</strong> {product.nutriments.proteins_100g || "N/A"} g</li>
                        </ul>
                     </div>

                     {/* Labels */}
                     <div className="mt-6">
                        <h3 className="text-xl font-bold text-gray-700">Labels</h3>
                        <p className="text-gray-600 text-lg mt-1">
                           {product.labels ? product.labels.replace(/,/g, ", ") : "No Labels Available"}
                        </p>
                     </div>

                     {/* Ingredients */}
                     <div className="mt-6">
                        <h3 className="text-xl font-bold text-gray-700">Ingredients</h3>
                        <p className="text-gray-600 text-lg mt-1">{product.ingredients_text || "No ingredients listed."}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Product;
