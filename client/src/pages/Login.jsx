import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", form);
    // Later connect to backend
  };

  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Login to continue discovering events"
    >
      <form onSubmit={handleSubmit}>
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
          className="w-full bg-indigo-600 text-white py-2 rounded-xl mt-2 hover:bg-indigo-700 transition duration-300"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-indigo-600 font-medium">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
