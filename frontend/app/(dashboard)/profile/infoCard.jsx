"use client";
import React from "react";

export default function InfoCard({ user }) {
  const profile = [
    { label: "Major", value: user?.major },
    { label: "Gender", value: user?.gender },
    { label: "Email", value: user?.email },
  ]
  return (
    <div className="mt-16 h-auto px-8 w-auto max-w-[720px]">
      {/* Name and Username */}
      <h1 className="text-2xl font-bold">{user?.username}</h1>
      <p className="text-gray-500">{user?.pronouns}</p>

      {/* --- Bio / Description --- */}
      <div className="mt-4 border border-gray-300 rounded-2xl p-4 bg-white">
        <p className="text-gray-700">
          {user?.bio || "No bio available."}
        </p>
      </div>

      {/* --- Personal Info --- */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Personal Information</h2>
      <div className="border border-gray-300 rounded-2xl p-4 bg-white w-full">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
    {[
      { label: "Faculty", value: user?.faculty },
      { label: "Major", value: user?.major },
      { label: "Email", value: user?.email },
      { label: "Phone", value: user?.phone },
    ].map(({ label, value }) => (
      <div key={label} className="flex flex-row">
        <span className="font-medium text-gray-600 mr-1 mb-1 md:mb-0">
          {label}:
        </span>
        <span className="text-gray-800">
          {value || "Not specified"}
        </span>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}
