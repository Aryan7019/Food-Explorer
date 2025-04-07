import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../App.css";
import { Link } from "react-router-dom";
import CategoryFilter from "../Features/category";

const API_URL = "https://world.openfoodfacts.org/cgi/search.pl?json=true";
const PRODUCTS_PER_PAGE = 16;

const getGradeColor = (grade) => {
  switch (grade?.toUpperCase()) {
    case "A": return "bg-green-500";
    case "B": return "bg-lime-500";
    case "C": return "bg-yellow-400";
    case "D": return "bg-orange-500";
    case "E": return "bg-red-500";
    default: return "bg-gray-400";
  }
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Home = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchAllPages = async (searchTerm = "") => {
    setLoading(true);
    setError(null);

    const isBarcode = /^\d{8,}$/.test(searchTerm);

    try {
      if (isBarcode) {
        const res = await axios.get(
          `https://world.openfoodfacts.org/api/v0/product/${searchTerm}.json`
        );
        if (res.data.status === 1) {
          const product = res.data.product;
          const mappedProduct = {
            id: product._id || product.code || Math.random().toString(36).substr(2, 9),
            name: product.product_name || "Unnamed Product",
            image: product.image_url || "https://via.placeholder.com/200",
            category: product.categories_tags?.[0]?.replace("en:", "").replace(/-/g, " ") || "Unknown Category",
            nutritionGrade: product.nutrition_grades || "N/A",
          };
          setAllProducts([mappedProduct]);
          setCategories([mappedProduct.category]);
        } else {
          setError("No product found for this barcode.");
          setAllProducts([]);
        }
      } else {
        let page = 1;
        let hasMore = true;
        const allFetchedProducts = [];
        const MAX_PAGES = 3;

        while (hasMore && page <= MAX_PAGES) {
          const response = await axios.get(
            `${API_URL}&page=${page}&page_size=50&search_terms=${searchTerm}`
          );
          const products = response.data.products;
          if (!products || products.length === 0) {
            hasMore = false;
          } else {
            const fetched = products.map((product) => ({
              id: product._id || product.code || Math.random().toString(36).substr(2, 9),
              name: product.product_name || "Unnamed Product",
              image: product.image_url || "https://via.placeholder.com/200",
              category: product.categories_tags?.[0]?.replace("en:", "").replace(/-/g, " ") || "Unknown Category",
              nutritionGrade: product.nutrition_grades || "N/A",
            }));
            allFetchedProducts.push(...fetched);
            page++;
            await new Promise((res) => setTimeout(res, 300));
          }
        }

        const uniqueCategories = Array.from(
          new Set(allFetchedProducts.map((p) => p.category).filter(Boolean))
        ).sort();

        setAllProducts(allFetchedProducts);
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPages(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    let filtered = [...allProducts];
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }
    switch (sortOption) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "grade-asc":
        filtered.sort((a, b) => a.nutritionGrade.localeCompare(b.nutritionGrade));
        break;
      case "grade-desc":
        filtered.sort((a, b) => b.nutritionGrade.localeCompare(a.nutritionGrade));
        break;
      default:
        break;
    }
    setFilteredProducts(filtered);
    setVisibleProducts(filtered.slice(0, PRODUCTS_PER_PAGE));
  }, [allProducts, selectedCategory, sortOption]);

  const loadMore = () => {
    const nextLength = visibleProducts.length + PRODUCTS_PER_PAGE;
    setVisibleProducts(filteredProducts.slice(0, nextLength));
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 font-[Inter] antialiased">
      <div className="bg-[#3A7D44] fixed top-0 left-0 z-50 w-full py-4 px-4 shadow-md">
        <div className="max-w-screen-xl mx-auto text-center">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            FOOD EXPLORER
          </h1>
        </div>
      </div>

      <div className="fixed top-[72px] left-0 w-full bg-gray-100 z-40 px-4 py-3 border-b border-gray-300 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-4 sm:gap-3">
          <input
            className="border border-gray-400 rounded-lg px-3 py-2 text-base w-full focus:ring-2 focus:ring-green-400"
            type="text"
            placeholder="Search by product name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-row flex-wrap items-center gap-4">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-green-400 text-sm w-1/3 md:w-40 ml-auto"
            >
              <option value="">Sort</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="grade-asc">Grade (Asc)</option>
              <option value="grade-desc">Grade (Desc)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-[230px]" />

      {error && (
        <div className="max-w-xl mx-auto bg-red-500 text-white font-medium text-md p-4 rounded-xl mt-10 text-center shadow-lg">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center mt-10 text-xl font-semibold text-gray-700">
          Loading...
        </div>
      )}

      {!error && !loading && (
        <TransitionGroup className="grid mt-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-6">
          {visibleProducts.map((product) => (
            <CSSTransition key={product.id} timeout={300} classNames="fade-scale">
              <Link to={`/product/${product.id}`} className="block hover:opacity-90 transition">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="w-full h-[200px] flex items-center justify-center bg-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h2 className="text-xl font-bold text-gray-800 truncate">{product.name}</h2>
                    <p className="text-sm text-gray-600 mt-1 italic">{product.category}</p>
                    <div
                      className={`mt-4 inline-block text-white text-sm font-semibold px-4 py-2 rounded-full uppercase ${getGradeColor(product.nutritionGrade)}`}
                    >
                      Nutrition Grade: {product.nutritionGrade.toUpperCase()}
                    </div>
                  </div>
                </div>
              </Link>
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}

      {visibleProducts.length < filteredProducts.length && !loading && (
        <div className="flex justify-center my-10">
          <button
            onClick={loadMore}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full text-lg shadow-lg transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
