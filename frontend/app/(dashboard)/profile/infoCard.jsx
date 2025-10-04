"use client"
import React from 'react';

export default function InfoCard(user) {

  return (
    <div className="mt-16 h-auto px-8 w-3xl">
      {/* Name and Username */}
      <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
      <p className="text-gray-500">@{user.username}</p>
      {/* Description */}
      <p className="mt-4 text-gray-700">{user.description || "No description available."}</p>
      {/* Personal Info */}
      <h2 className="text-xl font-semibold mt-6 mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="font-medium text-gray-600">Faculty:</span>{" "}
          <span className="text-gray-800">{user.faculty || "Not specified"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Major:</span>{" "}
          <span className="text-gray-800">{user.major || "Not specified"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Gender:</span>{" "}
          <span className="text-gray-800">{user.gender || "Not specified"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Birthday:</span>{" "}
          <span className="text-gray-800">{user.birthday || "Not specified"}</span>
        </div>
      </div>
      {/* Contact Info */}
      <h2 className="text-xl font-semibold mt-6 mb-4">Contact Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="font-medium text-gray-600">Phone:</span>{" "}
          <span className="text-gray-800">{user.phone || "Not specified"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Email:</span>{" "}
          <span className="text-gray-800">{user.email}</span>
        </div>
      </div>
    </div>
  );
}
