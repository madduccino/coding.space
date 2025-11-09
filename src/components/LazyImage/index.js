import React, { useState, useEffect } from "react";
import { withFirebase } from "../Firebase";

const LazyImage = ({ file, className }) => {
  // Generate GUID
  const generateGuid = () => {
    return "imgxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Initialize state
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("/images/loading.gif");
  const [guid] = useState(generateGuid());

  // ComponentDidMount & ComponentDidUpdate equivalent
  useEffect(() => {
    let isMounted = true;

    file
      .getDownloadURL()
      .then((url) => {
        if (isMounted) {
          setLoading(false);
          setUrl(url);
          console.log({ file, url }); // Logging the file and URL
        }
      })
      .catch((error) => {
        if (isMounted) {
          // Handle missing files gracefully
          setLoading(false);
          setUrl(""); // Clear URL so image won't render
          if (error.code !== 'storage/object-not-found') {
            console.error("Error loading image:", error);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file]); // The useEffect hook will re-run if the 'file' prop changes.

  // Render
  // Don't render anything if we had an error loading the image
  if (!loading && url === "") return null;

  // Show image (either loading state or actual image)
  return <img className={className} id={guid} key={guid} src={url} />;
};

export default withFirebase(LazyImage);
