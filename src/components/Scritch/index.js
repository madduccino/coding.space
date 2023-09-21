import React, { useState } from "react";
import "./scritch.scss";

const TransferScritchStudent = () => {
  const [name, setName] = useState("");
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [action, setAction] = useState("");
  const [message, setMessage] = useState("");

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

      const DATABASE_URL = "https://scritch-11f5a-default-rtdb.firebaseio.com/";

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

  return (
    <div className="main-content">
      <div className="form-container">
        <h2>Transfer Scritch Account</h2>
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
      </div>
    </div>
  );
};

export default TransferScritchStudent;
