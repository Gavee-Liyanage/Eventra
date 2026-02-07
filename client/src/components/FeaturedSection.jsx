import { ArrowRight } from "lucide-react";
import { use } from "react";
import { useNavigate } from "react-router-dom";
import { dummyEvents } from "../assets/assets";
import EventCard from "./EventCard";

const FeaturedSection = () => {

    const navigate = useNavigate();

  return (
    
    <div className="px-6 md:px-16 lg:px-24 overflow-hidden bg-gray-50 pb-10">
        <div className="relative flex item-center justify-between  pb-10" >
            <p className="text-3xl md:text-4xl font-bold mb-10 text-gray-700">
                Popular Events
            </p>
            <button onClick={()=>navigate("/events")} className="group flex items-center gap-2 text-m text-gray-700 cursor-pointer">
                View All
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
            </button>
        </div>

        {/* Event Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dummyEvents.slice(0,4).map((event) => (
                <EventCard key={event._id} event={event} />
            ))}

        </div>

        <div className="flex justify-center mt-20">   
            <button onClick={()=>{navigate("/events"); window.scrollTo(0,0)}} 
            className=" px-10 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer">
                Show More
            </button>
        </div>

    </div>    
  );
}

export default FeaturedSection;