
const uploadToCloudinary = async (file) => {
    
    const uploadPreset = process.env.UPLOAD_PRESET;
    const cloudName = process.env.CLOUDINARY_NAME;

    console.log(uploadPreset,cloudName);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data;
      } else {
        console.error("Error uploading image:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
};

module.exports = uploadToCloudinary;