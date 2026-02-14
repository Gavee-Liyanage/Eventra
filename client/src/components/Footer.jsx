import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-indigo-900 text-gray-300">

      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Discover */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">
            Discover
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/events" className="hover:text-indigo-300 transition">Find Events</Link></li>
            <li><Link to="/categories/music" className="hover:text-indigo-300 transition">Music</Link></li>
            <li><Link to="/categories/sports" className="hover:text-indigo-300 transition">Sports</Link></li>
            <li><Link to="/categories/festivals" className="hover:text-indigo-300 transition">Festivals</Link></li>
            <li><Link to="/categories/business" className="hover:text-indigo-300 transition">Business</Link></li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">
            About
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-indigo-300 transition">Our Story</Link></li>
            <li><Link to="/careers" className="hover:text-indigo-300 transition">Careers</Link></li>
            <li><Link to="/terms" className="hover:text-indigo-300 transition">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-indigo-300 transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">
            Help
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/faq" className="hover:text-indigo-300 transition">FAQ</Link></li>
            <li><Link to="/support" className="hover:text-indigo-300 transition">Support</Link></li>
            <li><Link to="/contact" className="hover:text-indigo-300 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">
            Stay Updated
          </h3>
          <p className="text-sm mb-4">
            Get the latest events & exclusive offers.
          </p>

          <div className="flex mb-6">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 bg-white rounded-l-lg text-gray-800 focus:outline-none"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r-lg text-white transition">
              Subscribe
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 text-lg">
            <a href="#" className="hover:text-indigo-300 transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-indigo-300 transition"><FaTwitter /></a>
            <a href="#" className="hover:text-indigo-300 transition"><FaInstagram /></a>
            <a href="#" className="hover:text-indigo-300 transition"><FaYoutube /></a>
            <a href="#" className="hover:text-indigo-300 transition"><FaLinkedinIn /></a>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t border-indigo-800 text-center py-6 text-sm text-gray-400">
        © {new Date().getFullYear()} QuickEvent. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;