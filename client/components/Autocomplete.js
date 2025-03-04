import { useState } from "react";
import { Search } from "lucide-react"; // Import the magnifying glass icon
import Fuse from "fuse.js";
import axios from "axios"; // Import axios for API requests
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { Roboto } from "next/font/google";

// Importing the Roboto font from next/font/google
const roboto = Roboto({
  weight: ["300", "400", "500"], // Adjust weights as needed
  subsets: ["latin"], // Ensure proper character support
});

const wordsArray = [
  "azalea", "andrew",
  "bitcoin", "btc", "butt", "biden", "bryant",
  "coin",
  "donald", "dog",
  "food",
  "hat", "head", "hot dog",
  "iggy",
  "joe", "job",
  "kobe",
  "minaj", "money",
  "nicki",
  "sunglasses", "strawberry",
  "trump", "tate",
  "viper",
  "wif"
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

    const loadToast = toast.loading("Searching for images...", {
      position: "bottom-center",
      hideProgressBar: true,
      draggable: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false
    });

    try {
      const response = await axios.post(baseUrl, {
        tags: chosenWords,
      });

      if (response.status === 200) {
        toast.update(loadToast, { render: `Found ${response.data.length} ${response.data.length === 1 ? 'image' : 'images'}!`, type: "success", isLoading: false, autoClose: 2000 });
        setImages(response.data); // Update state with fetched images
      }
    } catch (error) {
      console.log("Error fetching images:", error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 px-4 md:px-10">
      {/* Search Input - Responsive Width & Padding */}
      <div className="flex items-center w-full max-w-lg md:max-w-xl relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Type to search"
          className={`w-full p-2 md:p-3 text-xl md:text-2xl text-[#3a3a3a] placeholder-[#c0c0c0] focus:outline-none font-light ${roboto.className} border-l-2 border-[#9d91fe] rounded-none pl-4 md:pl-6`}
        />

        {/* Magnifying Glass Icon - Clickable */}
        <div
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 ml-2 rounded-full bg-[#9d91fe] shrink-0 cursor-pointer transition-transform duration-150 active:scale-90"
          onClick={handleSearch}
        >
          <Search size={24} color="white" />
        </div>
      </div>

      {/* Suggested Words Container - Wraps Flexibly */}
      {results.length > 0 && (
        <div className="w-full max-w-lg md:max-w-xl mt-6 md:mt-8 flex flex-wrap justify-start gap-2">
          {results.map((word, index) => (
            <div
              key={index}
              className={`px-3 py-1 text-sm md:text-base border rounded-full cursor-pointer transition 
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

      {/* Display Images in a Responsive Grid */}
      {images && images.length > 0 && (
        <div className="w-full max-w-lg md:max-w-xl mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <img
              key={index}
              src={img.secure_url}
              alt=""
              className="w-full h-auto rounded-lg object-cover"
            />
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
