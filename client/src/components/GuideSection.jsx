import React from "react";
import { CheckCircle } from "lucide-react";

const GuideSection = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 py-20 bg-gray-100">

      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* Image Layout (Same as Your Screenshot Style) */}
        <div className="relative flex gap-6">

          {/* Large Left Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1565145368739-29e5a81be478?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Event browsing"
              className="w-72 md:w-80 rounded-2xl shadow-lg object-cover"
            />
            {/* Decorative shape */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-red-400 rounded-full opacity-20"></div>
          </div>

          {/* Two Small Stacked Images */}
          <div className="flex flex-col gap-6 mt-10">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
              alt="Concert"
              className="w-56 rounded-2xl shadow-md object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1503428593586-e225b39bddfe"
              alt="Ticket booking"
              className="w-56 rounded-2xl shadow-md object-cover"
            />
          </div>

        </div>

        {/* Text Content */}
        <div>

          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
            How It Works
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Discover & Book Amazing Events Easily
          </h2>

          <div className="space-y-5">

            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-lg text-blue-600">Browse Events</h4>
                <p className="text-gray-600 text-sm">
                  Explore concerts, workshops, conferences, and festivals near you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-lg text-blue-600">Book in Seconds</h4>
                <p className="text-gray-600 text-sm">
                  Secure your tickets quickly with our simple and safe booking system.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-lg text-blue-600">Enjoy the Experience</h4>
                <p className="text-gray-600 text-sm">
                  Attend events, connect with people, and create unforgettable memories.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default GuideSection;
