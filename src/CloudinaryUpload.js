import React, { useState } from 'react';
import axios from 'axios';
import './CloudinaryUpload.css'; // Import the CSS file
import { toast } from 'react-toastify';
const notifySuccess = () =>
  toast.success('Image sucessfully added!', {
    position: 'top-right',
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark',
  });
function CloudinaryUpload({ setUploadedUrl, setImgLoader }) {
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'taskmo');
    setImgLoader(true);
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/danf9ztzz/image/upload`,
        formData
      );
      console.log('Upload successful! Image URL:', response.data.secure_url);
      setUploadedUrl(response.data.secure_url);
      notifySuccess();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImgLoader(false);
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
