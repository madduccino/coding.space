import React, { useState } from "react";
import { authenticateDirectory } from "./auth";

const DirectoryLogin = ({ onSuccess }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authenticateDirectory(code)) {
      setError("");
      onSuccess();
    } else {
      setError("Incorrect access code.");
    }
  };

  return (
    <div className="form-container directory-login">
      <h2>Student Directory</h2>
      <p>Enter the access code to search all Scritch students and classes.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="directory-access-code">Access code</label>
        <input
          id="directory-access-code"
          type="password"
          placeholder="Secret code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">Enter directory</button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DirectoryLogin;
