import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", form);
    // Later connect to backend
  };

  return (
    <AuthLayout
      title="Create Account 🚀"
      subtitle="Join Eventra and explore amazing events"
    >
      <form onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-xl mt-2 hover:bg-purple-700 transition duration-300"
        >
          Sign Up
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-purple-600 font-medium">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
