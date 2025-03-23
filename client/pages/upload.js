import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//const baseUrl = "http://localhost:3001";
const baseUrl = "https://memes-rgo0.onrender.com";

export default function Upload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Show image preview
      setUploadSuccess(false); // Re-enable upload button for new image
    }
  };

  const handleTagsChange = (event) => {
    // Allow only alphanumeric characters and commas
    const sanitizedInput = event.target.value.replace(/[^a-zA-Z0-9, ]/g, "");
    setTags(sanitizedInput);
  };

  const handleUpload = async () => {
    if (!image || !tags.trim()) {
      toast.error("Please select an image and enter tags.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("tags", tags);

    const toastId = toast.loading("Uploading image..."); // Keep loading until response

    setUploading(true); // Disable buttons during upload

    try {
      const response = await axios.post(`${baseUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.update(toastId, {
          render: "Image uploaded successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        console.log("Upload response:", response.data);
        setUploadSuccess(true); // Disable upload button after success
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to upload image.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Upload failed:", error.response?.data?.message || error.message);
    } finally {
      setUploading(false); // Re-enable select button after upload finishes
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <h1 className="text-2xl text-gray-800 mb-8 text-center">Upload a meme! 🐹</h1>

      {/* Info Container */}
      <div className="info-container bg-blue-100 text-blue-800 rounded-lg p-4 flex items-center w-full max-w-md mb-6 shadow-md">
        {/* Info Icon */}
        <svg
          className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm.75 15.25h-1.5v-6h1.5zm0-7.5h-1.5V8h1.5z" />
        </svg>

        {/* Info Text */}
        <ul className="text-sm">
          <li>Use the form below to upload a meme to the cloud.</li>
          <li>Add tags (separated by commas) so the image is searchable!</li>
        </ul>
      </div>

      <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
        {/* Image Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className={`mx-auto w-40 h-40 object-cover rounded-lg mb-4 shadow-md ${
              uploadSuccess ? "opacity-20" : "opacity-100"
            }`}
          />
        )}

        {/* File Input */}
        <label
          className={`block w-full text-center ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } text-white py-2 rounded-lg transition`}
        >
          Select Image
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
        </label>

        {/* Tags Input */}
        <input
          type="text"
          value={tags}
          onChange={handleTagsChange}
          placeholder="Enter tags (comma separated)"
          className="w-full mt-4 p-3 border border-gray-400 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || uploadSuccess}
          className={`w-full mt-4 py-2 rounded-lg transition ${
            uploading || uploadSuccess ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}
