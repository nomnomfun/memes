import { FaSearch } from 'react-icons/fa'; // Import the search icon from react-icons

export default function Navbar() {
  return (
    <div className="bg-gray-800 text-white p-2 w-full flex justify-end items-center">
      {/* Replace the Unicode magnifying glass with FaSearch icon */}
      <div className="text-xl cursor-pointer">
        <FaSearch />
      </div>
    </div>
  );
}
