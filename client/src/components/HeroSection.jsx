import React from "react";
import { assets } from "../assets/assets";
import { Search } from "lucide-react";

const HeroSection = () => {
  return (
    <div
      className="relative flex items-center justify-center h-screen bg-cover bg-center text-center"
      style={{ backgroundImage: `url(${assets.background_img_1})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 lg:px-36 max-w-5xl w-full">

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Discover the Best Events in Your City!
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-200 mb-10">
          Find concerts, festivals, shows and more happening near you.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden">

          {/* Keyword Input */}
          <input
            type="text"
            placeholder="What are you looking for?"
            className="px-6 py-4 w-full md:w-64 outline-none text-gray-700"
          />

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Location Select */}
          <select className="px-6 py-4 w-full md:w-48 outline-none text-gray-700">
            <option>Location</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
          </select>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Date Input */}
          <input
            type="date"
            className="px-6 py-4 w-full md:w-48 outline-none text-gray-700"
          />

          {/* Search Button */}
          <button className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 font-semibold transition duration-300">
            <Search size={18} />
            Search
          </button>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
