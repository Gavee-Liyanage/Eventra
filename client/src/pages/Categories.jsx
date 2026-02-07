import React from "react"; 

import {
  Music,
  Moon,
  Drama,
  Calendar,
  Heart,
  Gamepad2,
  Briefcase,
  Utensils,
} from "lucide-react";

const categories = [
  { name: "Music", icon: Music },
  { name: "Nightlife", icon: Moon },
  { name: "Performing & Visual Arts", icon: Drama },
  { name: "Holidays", icon: Calendar },
  { name: "Dating", icon: Heart },
  { name: "Hobbies", icon: Gamepad2 },
  { name: "Business", icon: Briefcase },
  { name: "Food & Drink", icon: Utensils },
];

const Categories = () => {
  return (
    <div className="w-full bg-gray-50 py-16 px-6 md:px-16 lg:px-24">
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-gray-700">
        Browse by Category
      </h2>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-8">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-24 h-24 flex items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition duration-300">
                <Icon size={32} className="text-gray-700" />
              </div>

              <p className="mt-4 text-sm text-center font-medium text-gray-700 group-hover:text-black transition">
                {category.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 

export default Categories;