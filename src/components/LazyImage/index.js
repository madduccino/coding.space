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
    file.getDownloadURL().then((url) => {
      setLoading(false);
      setUrl(url);
    });
  }, [file]); // The useEffect hook will re-run if the 'file' prop changes.

  // Render
  return <img className={className} id={guid} key={guid} src={url} />;
};

export default withFirebase(LazyImage);
