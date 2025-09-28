import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  return (
    <div className="w-full">
      {/* Banner Section */}
      <div className="relative w-full h-48 bg-gray-300">
        {/* Banner Image */}
        <img
          src="/images/profile-banner.jpg"
          alt="Profile Banner"
          className="w-full h-full object-cover"
        />

        {/* Avatar and Edit Button */}
        <div className="absolute -bottom-12 left-0 w-full px-8 flex items-center justify-between">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="mt-16 px-8">
        <h1 className="text-2xl font-bold">John Doe</h1>
        <p className="text-gray-500">@johndoe</p>

        <p className="mt-4 text-gray-700 max-w-2xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        </p>
      </div>
    </div>
  );
}
