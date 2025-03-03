import Autocomplete from "../components/Autocomplete";
import Navbar from "@/components/Navbar";

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
