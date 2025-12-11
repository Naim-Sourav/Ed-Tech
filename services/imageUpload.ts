
// This service handles image uploads to Cloudinary

const CLOUD_NAME = "dtqybqcyd"; 
const UPLOAD_PRESET = "dopamine_preset"; 

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "dopamine_profiles"); // Optional: Folder name in Cloudinary

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    // Return the secure URL ensuring it's HTTPS and optimized
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
