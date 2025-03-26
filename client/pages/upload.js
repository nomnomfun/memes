import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDelete } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { MdError } from "react-icons/md";

// const baseUrl = "http://localhost:3001";
const baseUrl = "https://memes-rgo0.onrender.com";

export default function Upload() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imageTags, setImageTags] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [selectedImages, setSelectedImages] = useState(new Set());

  // Handle paste event for images
  const handlePaste = (event) => {
    const clipboardItems = event.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const newImages = [...images, file];
          setImages(newImages);
          setPreviews([...previews, URL.createObjectURL(file)]);

          const newStatus = {};
          newImages.forEach((_, index) => {
            if (!(index in uploadStatus)) newStatus[index] = null;
          });

          setUploadStatus((prev) => ({ ...prev, ...newStatus }));
        }
      }
    }
  };

  // Add event listener for paste
  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [images, previews, uploadStatus]);

  // Handle drag over event to allow drop
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle drop event for images or files
  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    if (files.length > 0) {
      const newImages = [...images, ...files];
      setImages(newImages);
      setPreviews([...previews, ...files.map((file) => URL.createObjectURL(file))]);

      const newStatus = {};
      newImages.forEach((_, index) => {
        if (!(index in uploadStatus)) newStatus[index] = null;
      });

      setUploadStatus((prev) => ({ ...prev, ...newStatus }));
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const newImages = [...images, ...files];
      setImages(newImages);
      setPreviews([...previews, ...files.map((file) => URL.createObjectURL(file))]);

      const newStatus = {};
      newImages.forEach((_, index) => {
        if (!(index in uploadStatus)) newStatus[index] = null;
      });

      setUploadStatus((prev) => ({ ...prev, ...newStatus }));
    }
  };

  const handleTagsChange = (index, event) => {
    const sanitizedInput = event.target.value.replace(/[^a-zA-Z0-9, ]/g, "");
    setImageTags((prev) => ({
      ...prev,
      [index]: sanitizedInput,
    }));
  };

  const toggleImageSelection = (index) => {
    setSelectedImages((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading images...");

    try {
      const uploadPromises = images.map(async (image, index) => {
        if (uploadStatus[index] === "success") return;
        setUploadStatus((prev) => ({ ...prev, [index]: "loading" }));

        const formData = new FormData();
        formData.append("image", image);
        formData.append("tags", imageTags[index] || "");

        const response = await axios.post(`${baseUrl}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200) {
          setUploadStatus((prev) => ({ ...prev, [index]: "success" }));
          return response.data;
        } else {
          setUploadStatus((prev) => ({ ...prev, [index]: "error" }));
          throw new Error("Upload failed");
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results.filter((res) => res.status === "fulfilled");

      if (successfulUploads.length > 0) {
        toast.update(toastId, {
          render: `${successfulUploads.length} image(s) uploaded successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "No images were uploaded successfully.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to upload images.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = () => {
    // Get the remaining images after deletion
    const remainingImages = images.filter((_, index) => !selectedImages.has(index));

    // Create a new tags object by keeping only the tags for the remaining images
    const remainingTags = {};

    // Iterate over the original `images` array to map the correct tags
    let newIndex = 0;
    images.forEach((image, index) => {
      if (!selectedImages.has(index)) {
        remainingTags[newIndex] = imageTags[index]; // Retain tags for images that are not deleted
        newIndex++;
      }
    });

    // Update state with the new list of images and their associated tags
    setImages(remainingImages);
    setPreviews(remainingImages.map((file) => URL.createObjectURL(file)));

    // Update imageTags to keep tags for the remaining images
    setImageTags(remainingTags);

    // Remove the deleted images' upload status
    setUploadStatus((prev) => {
      const newStatus = { ...prev };
      selectedImages.forEach((index) => {
        delete newStatus[index];
      });
      return newStatus;
    });

    // Clear the selected images set
    setSelectedImages(new Set());
  };

  // Check if the upload button should be enabled
  const isUploadButtonEnabled =
    images.length > 0 &&
    Object.values(uploadStatus).some((status) => status !== "success");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <h1 className="text-2xl text-gray-800 mb-8 text-center">Upload memes! 🐹</h1>

      <div className="info-container bg-blue-100 text-blue-800 rounded-lg p-4 flex items-center w-full max-w-md mb-6 shadow-md">
        <svg
          className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm.75 15.25h-1.5v-6h1.5zm0-7.5h-1.5V8h1.5z" />
        </svg>
        <ul className="text-sm">
          <li>Select memes to be uploaded.</li>
          <li>&nbsp;</li>
          <li>Select images from your device, pasted from the clipboard, or dragged and dropped.</li>
          <li>&nbsp;</li>
          <li>Click images to mark them for deletion.</li>
          <li>&nbsp;</li>
          <li>Add tags (separated by commas) before you upload!</li>
        </ul>
      </div>

      <div
        className="w-full max-w-md p-6 rounded-lg shadow-lg border-2 border-dashed border-blue-300"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          {previews.map((src, index) => (
            <div
              key={index}
              className={`relative w-24 h-24 cursor-pointer rounded-lg ${
                selectedImages.has(index) ? "border-4 border-blue-500" : ""
              }`}
              onClick={() => toggleImageSelection(index)}
            >
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
              {uploadStatus[index] === "loading" && (
                <div className="absolute inset-0 bg-transparent bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin border-t-4 border-white border-solid rounded-full h-6 w-6"></div>
                </div>
              )}
              {uploadStatus[index] === "success" && (
                <div className="absolute top-0 right-0 m-2 flex items-center justify-center">
                  <FaCircleCheck className="text-green-400 bg-white rounded-full w-6 h-6 text-xl" />
                </div>
              )}
              {uploadStatus[index] === "error" && (
                <div className="absolute top-0 right-0 m-2 flex items-center justify-center">
                  <MdError className="text-red-500 bg-white rounded-full w-6 h-6 text-xl" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* File Input */}
        <label
          className={`block w-full text-center cursor-pointer ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } text-white py-2 rounded-lg transition`}
        >
          Select Images
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" disabled={uploading} />
        </label>

        {/* Tags Input for each image */}
        {images.length > 0 && (
          <div>
            {images.map((_, index) => (
              <input
                key={index}
                type="text"
                value={imageTags[index] || ""}
                onChange={(e) => handleTagsChange(index, e)}
                placeholder={`Tags for image ${index + 1} (comma separated)`}
                className="w-full mt-2 p-3 border border-gray-400 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={images.length === 0} // Disable if no images are uploaded
              />
            ))}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !isUploadButtonEnabled}
          className={`w-full mt-4 py-2 rounded-lg transition cursor-pointer ${
            uploading || !isUploadButtonEnabled
              ? "bg-gray-300 cursor-not-allowed opacity-50 text-gray-600"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>


        {/* Delete Selected Button (Trash Icon Only) */}
        {selectedImages.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="mt-4 w-12 h-12 flex items-center justify-center bg-white drop-shadow-md text-white rounded-full hover:opacity-90 cursor-pointer focus:outline-none mx-auto"
          >
            <MdDelete className="text-red-500 text-xl" />
          </button>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
