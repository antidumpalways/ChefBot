"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { CATEGORIES_URL } from "@/lib/urls";

interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  useEffect(() => {
    fetch(CATEGORIES_URL)
      .then((res) => res.json())
      .then((data) => {
        const sortedCategories = data.categories.sort((a: Category, b: Category) => {
          const priority = ["Dessert", "Vegetarian", "Pasta", "Beef", "Chicken", "Seafood"];
          const aIndex = priority.findIndex((cat) =>
            a.strCategory.toLowerCase().includes(cat.toLowerCase())
          );
          const bIndex = priority.findIndex((cat) =>
            b.strCategory.toLowerCase().includes(cat.toLowerCase())
          );
          
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.strCategory.localeCompare(b.strCategory);
        });
        setCategories(sortedCategories);
      })
      .catch((error) => console.error("Error fetching categories:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar
        showResults={showResults}
        setShowResults={setShowResults}
        handleSearchFocus={handleSearchFocus}
        handleBlur={handleBlur}
      />
      <div className={`page-container flex flex-col items-center bg-base-100 transition-all duration-300 ${
        showResults ? "opacity-80 blur-sm" : "opacity-100"
      }`}>
        <h1 className="text-4xl md:text-6xl text-secondary mb-5 text-center">
          Recipe Categories 📂
        </h1>
        <p className="text-lg text-base-content/70 mb-10 text-center max-w-2xl">
          Explore delicious recipes organized by cuisine and meal type. 
          Click on any category to discover amazing dishes!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <LoadingCard key={i} />)
          ) : (
            categories.map((category) => (
              <Link
                key={category.idCategory}
                href={`/category/${category.strCategory}`}
                className="group"
              >
                <div className="card card-compact w-full bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <figure className="relative overflow-hidden">
                    <Image
                      src={category.strCategoryThumb}
                      alt={category.strCategory}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title text-lg text-base-content capitalize">
                      {category.strCategory}
                    </h2>
                    <p className="text-sm text-base-content/70 line-clamp-3">
                      {category.strCategoryDescription}
                    </p>
                    <div className="card-actions justify-end mt-2">
                      <button className="btn btn-primary btn-sm">
                        Explore 🍴
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="bg-base-100">
        <Footer />
      </div>
    </>
  );
}

function LoadingCard() {
  return (
    <div className="card card-compact w-full bg-base-200 shadow-xl">
      <div className="skeleton h-48 w-full"></div>
      <div className="card-body">
        <div className="skeleton h-4 w-3/4"></div>
        <div className="skeleton h-3 w-full"></div>
        <div className="skeleton h-3 w-2/3"></div>
        <div className="skeleton h-8 w-20 ml-auto"></div>
      </div>
    </div>
  );
}
