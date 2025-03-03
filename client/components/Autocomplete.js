import { useState } from "react";
import { Search } from "lucide-react"; // Import the magnifying glass icon
import Fuse from "fuse.js";
import axios from "axios"; // Import axios for API requests
import { Roboto } from "next/font/google";

// Importing the Roboto font from next/font/google
const roboto = Roboto({
  weight: ["300", "400", "500"], // Adjust weights as needed
  subsets: ["latin"], // Ensure proper character support
});

const wordsArray = [
  "azalea",
  "bitcoin", "btc", "butt", "biden", "bryant",
  "coin",
  "donald",
  "head",
  "iggy",
  "joe", "job",
  "kobe",
  "minaj", "money",
  "nicki",
  "trump"
];

const fuse = new Fuse(wordsArray, {
  includeScore: true,
  threshold: 0.4, // Adjusts match sensitivity
});

const baseUrl = "http://localhost:3001/find";

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(wordsArray); // Initialize with all words
  const [chosenWords, setChosenWords] = useState([]); // Stores selected words
  const [images, setImages] = useState([]); // Store fetched images

  const updateResults = (input, updatedChosenWords) => {
    if (input.trim() === "") {
      setResults([...updatedChosenWords, ...wordsArray.filter(w => !updatedChosenWords.includes(w))]);
      return;
    }

    const searchResults = fuse
      .search(input)
      .map((result) => result.item)
      .filter((word) => !updatedChosenWords.includes(word)); // Exclude selected words from regular results

    setResults([...updatedChosenWords, ...searchResults]); // Ensure selected words appear first
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    updateResults(input, chosenWords);
  };

  const handleSelect = (word) => {
    let updatedChosenWords;
    if (chosenWords.includes(word)) {
      // Remove word from selection
      updatedChosenWords = chosenWords.filter((w) => w !== word);
    } else {
      // Add word to selection
      updatedChosenWords = [...chosenWords, word];
    }
    setChosenWords(updatedChosenWords);
    updateResults(query, updatedChosenWords); // Rerun search with updated selection
  };

  const handleSearch = async () => {
    if (chosenWords.length === 0) return; // Don't search if no tags are selected

    try {
      const response = await axios.post(baseUrl, {
        tags: chosenWords,
      });

      if (response.status === 200) {
        setImages(response.data); // Update state with fetched images
      }
    } catch (error) {
      console.log("Error fetching images:", error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      {/* Search Input - Centered Horizontally with Icon */}
      <div className="flex items-center w-xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Type to search"
          className={`w-full p-3 text-5xl text-[#3a3a3a] placeholder-[#c0c0c0] focus:outline-none font-light ${roboto.className} border-l-2 border-[#9d91fe] rounded-none pl-6`}
        />

        {/* Magnifying Glass Icon Container */}
        <div
          className="flex items-center justify-center w-12 h-12 ml-2 rounded-full bg-[#9d91fe] shrink-0 cursor-pointer transition-transform duration-150 active:scale-90"
          onClick={handleSearch}
        >
          <Search size={24} color="white" />
        </div>
      </div>

      {/* Suggested Words Container with additional margin */}
      {results.length > 0 && (
        <div className="w-xl mt-8 mx-auto flex flex-wrap justify-start gap-2">
          {results.map((word, index) => (
            <div
              key={index}
              className={`px-3 py-1 border rounded-full cursor-pointer transition 
                ${chosenWords.includes(word)
                ? "bg-[#9d91fe] border-[#9d91fe] text-[#fefeff] font-bold"
                : "bg-white border-[#c0c0c0] text-[#3a3a3a] hover:bg-gray-600 hover:text-white"}
              `}
              onClick={() => handleSelect(word)}
            >
              {word}
            </div>
          ))}
        </div>
      )}

      {/* Display Images in a Grid */}
      {images && images.length > 0 && (
        <div className="w-xl mt-8 mx-auto grid grid-cols-3 gap-4">
          {images.map((img, index) => (
            <img key={index} src={img.secure_url} alt="" className="w-full h-auto rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}
