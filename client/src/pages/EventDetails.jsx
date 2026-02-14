import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!event) return <p className="pt-40 text-center">Loading...</p>;

  return (
    <div
      onClick={() => navigate(`/event/${event._id}`)}
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-xl transition duration-300">

      <img
        src={event.image} alt={event.title} className="w-full h-52 object-cover"
      />

      <div className="p-5">
        

        <h3 className="text-lg font-bold mt-3 text-gray-800">
          {event.title}
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          {new Date(event.date).toLocaleString()}
        </p>

        <p className="text-gray-500 text-sm">{event.location}</p>

        <p className="text-indigo-600 font-semibold mt-2">
          ${event.price}
        </p>

        <p className="text-gray-700">{event.description}</p>
      </div>
    </div>
  );
};

export default EventDetails;
