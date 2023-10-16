import React, { useState, useRef } from "react";
import "./scritch.scss";
import clipboardCopy from "clipboard-copy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const EditScritch = () => {
  const [name, setName] = useState("");
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [action, setAction] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [showCodeDisplay, setShowCodeDisplay] = useState(false); // Add a state variable to control code display

  const DATABASE_URL = "https://scritch-11f5a-default-rtdb.firebaseio.com/";

  const handleSubmission = async () => {
    try {
      if (!name || !fromClass || !toClass || !action) {
        setMessage("Please fill in all fields."); // Display validation error message
        return;
      }

      setMessage("Processing...");

      const STUDENT = name.toLowerCase();
      const FROM_CLASS = fromClass.toLowerCase();
      const TO_CLASS = toClass.toLowerCase();
      const ACTION = action.toLowerCase();

      // Fetch class data for FROM_CLASS
      const classDataResponse = await fetch(
        `${DATABASE_URL}/classes/${FROM_CLASS}/students.json`
      );

      if (!classDataResponse.ok) {
        throw new Error("Failed to fetch class data.");
      }

      const json = await classDataResponse.json();
      const keys = Object.keys(json);
      const username = keys.find((key) => key.includes(STUDENT));

      if (!username) {
        throw new Error(`Student with name ${name} not found.`);
      }

      const encodedUsername = encodeURIComponent(unquote(username));

      // Fetch student data for the student in FROM_CLASS
      const studentDataResponse = await fetch(
        `${DATABASE_URL}/classes/${FROM_CLASS}/students/${encodedUsername}.json`
      );

      if (!studentDataResponse.ok) {
        throw new Error("Failed to fetch student data.");
      }

      const jsonData = await studentDataResponse.json();

      // Copy student data to the new class (TO_CLASS)
      const copyStudentResponse = await fetch(
        `${DATABASE_URL}/classes/${TO_CLASS}/students/${encodedUsername}.json`,
        {
          method: "PATCH",
          body: JSON.stringify(jsonData),
        }
      );

      if (!copyStudentResponse.ok) {
        throw new Error("Failed to copy student data to the new class.");
      }

      // Delete from old class if moving
      if (ACTION === "move") {
        const deleteResponse = await fetch(
          `${DATABASE_URL}/classes/${FROM_CLASS}/students/${encodedUsername}.json`,
          {
            method: "DELETE",
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete student from the old class.");
        }
      }

      setMessage("Submission successful.");
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const unquote = (str) => str.replace(/^"(.*)"$/, "$1");

  const generateRandomCode = () => {
    const characters = "abcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  const [classCode, setClassCode] = useState(generateRandomCode());
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [classTitle, setClassTitle] = useState(""); // New state for class title

  const handleClassTitleChange = (e) => {
    setClassTitle(e.target.value);
  };

  const createClass = async () => {
    try {
      if (!classTitle) {
        setErrorMessage("Please enter a class title.");
        return;
      }

      const CODE = classCode;
      const TITLE = classTitle;

      const checkResponse = await fetch(`${DATABASE_URL}/classes/${CODE}.json`);

      if (checkResponse.ok) {
        const responseData = await checkResponse.json();
        if (responseData != null) {
          // Code already exists, generate a new one
          const newCode = generateRandomCode();
          setErrorMessage(
            `Code ${CODE} already exists in the database. A new code (${newCode}) has been generated.`
          );
          setClassCode(newCode); // Set the new code in the component state
          return;
        }
      }

      // Define the data to add in the database
      const addClass = {
        title: classTitle,
      };

      // Create the request configuration
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addClass),
      };

      // Send the PUT request to create new data in the database
      const response = await fetch(
        `${DATABASE_URL}/classes/${CODE}.json`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Failed to create class.");
      }
      setSuccessMessage(
        <p>
          Class created successfully with code: {CODE} and title: {TITLE}. You
          can access it{" "}
          <a
            href={`https://scritch.dev/#${classCode}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      );

      setShowCodeDisplay(true);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const toggleCase = () => {
    setClassCode(
      isUpperCase ? classCode.toLowerCase() : classCode.toUpperCase()
    );
    setIsUpperCase(!isUpperCase);
  };

  const copyToClipboard = () => {
    clipboardCopy(classCode);
    setCopyMessage("Copied!");
    // Reset the copyMessage after 2 seconds (2000 milliseconds)
    setTimeout(() => {
      setCopyMessage("");
    }, 1000);
  };

  return (
    <div className="main-content">
      <div className="form-container">
        <h2>Create Scritch Class</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClass();
          }}
        >
          <input
            type="text"
            placeholder="Class Title (e.g., Tuesday UES Fall 2023)"
            value={classTitle}
            onChange={handleClassTitleChange}
          />
          <button onClick={createClass}>Create Class</button>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
        </form>
        {showCodeDisplay && (
          <div className="code-container">
            <div className="code-display">
              <span>
                Class Code:{" "}
                {isUpperCase
                  ? classCode.toUpperCase()
                  : classCode.toLowerCase()}
              </span>
            </div>
            <div className="icon-buttons">
              <button className="toggle-button" onClick={toggleCase}>
                <i className="fas fa-exchange-alt"></i>{" "}
                {/* Font Awesome icon for toggle */}
              </button>
              <button className="copy-button" onClick={copyToClipboard}>
                <i className="fas fa-clipboard"></i>{" "}
                {/* Font Awesome icon for copy */}
              </button>
            </div>
            {copyMessage && (
              <div className="success-message">{copyMessage}</div>
            )}
          </div>
        )}
      </div>
      <div className="form-container">
        <h2>Transfer Scritch Account</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmission();
          }}
        >
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            placeholder="First name and last name initial"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="fromClass">From Class:</label>
          <input
            type="text"
            id="fromClass"
            placeholder="Current Scritch class code"
            value={fromClass}
            onChange={(e) => setFromClass(e.target.value)}
          />

          <label htmlFor="toClass">To Class:</label>
          <input
            type="text"
            id="toClass"
            value={toClass}
            placeholder="New Scritch class code"
            onChange={(e) => setToClass(e.target.value)}
          />

          <label htmlFor="action">Action:</label>
          <select
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">Select an action</option>
            <option value="copy">Copy</option>
            <option value="move">Move</option>
          </select>

          <button id="submitBtn" onClick={handleSubmission}>
            Submit
          </button>

          {message && (
            <div
              className={
                message.includes("Error") ? "error-message" : "success-message"
              }
            >
              {message}
            </div>
          )}
        </form>
      </div>
      <div className="notes">
        <p>To delete a class, please email maddy@thecodingspace.com.</p>
      </div>
    </div>
  );
};

export default EditScritch;
