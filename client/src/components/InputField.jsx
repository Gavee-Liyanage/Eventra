import React from "react";

const InputField = ({ label, type, name, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2 text-sm font-medium">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-xl 
        bg-linear-to-r from-indigo-50 to-purple-50 
        border border-indigo-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500 
        transition duration-300"

        required
      />
    </div>
  );
};

export default InputField;
