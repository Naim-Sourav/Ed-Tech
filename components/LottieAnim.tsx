
import React from 'react';
import Lottie from 'lottie-react';

interface LottieAnimProps {
  animationData?: any; // For local JSON import
  url?: string;        // For remote URL
  className?: string;
  loop?: boolean;
  fallback?: React.ReactNode; // What to show if loading fails
}

const LottieAnim: React.FC<LottieAnimProps> = ({ animationData, url, className, loop = true, fallback }) => {
  const [animData, setAnimData] = React.useState<any>(animationData);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    // Reset state when URL changes
    if (url) {
      setAnimData(null);
      setError(false);
      
      fetch(url)
        .then(async (res) => {
            if (!res.ok) throw new Error("Network error");
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid content type");
            }
            return res.json();
        })
        .then((data) => setAnimData(data))
        .catch((err) => {
            console.warn("Lottie Load Skipped (Using Fallback):", err.message);
            setError(true);
        });
    }
  }, [url]);

  // If local data passed, use it immediately
  React.useEffect(() => {
      if (animationData) setAnimData(animationData);
  }, [animationData]);

  if (error || !animData) {
      return <div className={className + " flex items-center justify-center"}>{fallback}</div>;
  }

  return (
    <Lottie 
      animationData={animData} 
      loop={loop} 
      className={className} 
    />
  );
};

export default LottieAnim;
