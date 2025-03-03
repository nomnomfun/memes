import Autocomplete from "../components/Autocomplete";

//const baseUrl = 'https://nomnom-1u79.onrender.com/find';
const baseUrl = 'http://localhost:3001/find';

export default function Home() {
  const handleSelect = (word) => {
    console.log("Selected:", word);
  };

  return (
    <div className="bg-[#fefeff] min-h-screen"> {/* Updated background color */}
      <div className="flex justify-center">
        <div>
          <Autocomplete onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}
