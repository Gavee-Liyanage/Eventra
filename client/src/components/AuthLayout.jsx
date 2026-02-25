// client/src/components/AuthLayout.jsx
import React from "react";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-white/80 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT IMAGE */}
            <div className="hidden md:block relative">
              <img
                src={AUTH_IMAGE}
                alt="auth"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/70 via-purple-700/40 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <div className="absolute bottom-0 p-8 text-white">
                <p className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                  QuickShow • Sri Lanka
                </p>
                <h3 className="mt-4 text-3xl font-extrabold leading-tight">
                  {title || "Welcome"}
                </h3>
                <p className="mt-2 text-white/80 text-sm">
                  {subtitle || "Continue to your account"}
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {title || "Welcome"}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}

              <div className="mt-6">{children}</div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          © {new Date().getFullYear()} QuickShow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;