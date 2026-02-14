import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dummyEvents } from "../assets/assets";
import EventCard from "./EventCard";

const FeaturedSection = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 md:px-16 lg:px-24 overflow-hidden bg-gray-50 py-14">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-12">
        
        {/* Modern Title */}
        <div>
            <h2 className="text-3xl md:text-4xl font-bold relative inline-block bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Popular Events
            <span className="absolute left-0 -bottom-2 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
            </h2>
        </div>

        {/* Modern View All Button */}
        <button
          onClick={() => navigate("/events")}
          className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          View All
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </button>

      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyEvents.slice(0, 4).map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-12 mt-20">
        
        {/* Modern Title */}
        <div>
            <h2 className="text-3xl md:text-4xl font-bold relative inline-block bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Upcomming Events
            <span className="absolute left-0 -bottom-2 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
            </h2>
        </div>

        {/* Modern View All Button */}
        <button
          onClick={() => navigate("/events")}
          className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          View All
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </button>

      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyEvents.slice(4, 9).map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

    </div>
  );
};

export default FeaturedSection;