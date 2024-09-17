import React, { useState } from 'react';
import axios from 'axios';
import './CloudinaryUpload.css'; // Import the CSS file

function CloudinaryUpload({ setUploadedUrl }) {
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'taskmo');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/danf9ztzz/image/upload`,
        formData
      );
      console.log('Upload successful! Image URL:', response.data.secure_url);
      setUploadedUrl(response.data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="upload-container">
      {/* <h2 className="upload-title">Upload Image to Cloudinary</h2> */}
      <input
        type="file"
        accept="image/*"
        capture="environment" // For mobile to capture images from camera
        onChange={handleChange}
        className="file-input"
      />

      <button onClick={handleUpload} className="upload-button">
        Upload Image
      </button>
    </div>
  );
}

export default CloudinaryUpload;
