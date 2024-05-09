import React, { useState, useEffect } from "react";
import LazyImage from "../LazyImage";
import { withAuthentication } from "../Session";
import { withFirebase, storage } from "../Firebase";
import TCSEditor from "../TCSEditor";
import { v4 as uuidv4 } from "uuid";
import * as ROUTES from "../../constants/routes";
import * as FILTERS from "../../constants/filter";
import "./new-project.scss";

const NewProjectPageBase = ({ authUser, firebase, history }) => {
  const [untutorial, setUntutorial] = useState({
    key: uuidv4(),
    Author: null,
    Description: "",
    Categories: {},
    Level: 1,
    ThumbnailFilename: null,
    Title: "",
    Status: "DRAFT",
    steps: [
      {
        Description: "",
        Title: "",
        DescriptionSp: "",
      },
    ],
  });
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [untutorialRef, setUntutorialRef] = useState(null);
  const [lang, setLang] = useState("en");

  const [errors, setErrors] = useState({
    Title: "",
    Step0: "Step 1 is Required",
    Description: "",
    Categories: "",
  });
  const stepCount = Object.keys(untutorial.steps).length;

  // Assuming you have declared your state and other necessary hooks earlier in the component.
  useEffect(() => {
    let isMounted = true; // Flag to handle asynchronous tasks

    // Equivalent to componentDidMount logic
    let pCopy = { ...untutorial }; // Create a copy of untutorial
    console.log(pCopy);

    const onUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onUnload);

    if (authUser && isMounted) {
      pCopy.Author = authUser.key;

      // Update state with the new copy of untutorial and the reference
      setUntutorial(pCopy);
      setUntutorialRef(firebase.untutorial(pCopy.key));
      setLoading(false);
    }

    // Cleanup function equivalent to componentWillUnmount in class component
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      isMounted = false; // Set the flag to false when the component is unmounted
    };
  }, [authUser, firebase]); // Only re-run the effect if authUser or firebase changes

  const handleStepTitleOnChange = (value, step) => {
    var pCopy = { ...untutorial };
    if (value !== pCopy.steps[step].Title) {
      pCopy.steps[step].Title = value;
    }
    setUntutorial(pCopy, () => handleStepValidate(pCopy.steps[step], step));
  };

  const handleStepOnChange = (value, step) => {
    var pCopy = { ...untutorial };
    if (value !== pCopy.steps[step].Description) {
      pCopy.steps[step].Description = value;
    }
    setUntutorial(pCopy, () => handleStepValidate(pCopy.steps[step], step));
  };

  const handleStepOnSave = () => {};

  // Function to handle validation of step
  const handleStepValidate = (step, index) => {
    // Create a new copy of errors
    let newErrors = { ...errors };

    // Check if the step description is empty or just contains an empty paragraph
    if (step.Description.length === 0 || step.Description === "<p><br></p>") {
      newErrors["Step" + index] = `Step ${parseInt(index) + 1} is Required`;
    } else {
      // If the step is valid, remove any existing error for this step
      delete newErrors["Step" + index];
    }

    // Update the state with the new errors object
    setErrors(newErrors);
  };

  const handlePTitleOnChange = (value) => {
    setUntutorial((prevUntutorial) => ({
      ...prevUntutorial,
      Title: value,
    }));
  };

  const handleLevelOnChange = (value) => {
    setUntutorial((prevUntutorial) => ({
      ...prevUntutorial,
      Level: value,
    }));
  };

  const handleLevelOnSave = () => {};

  const handlePDescriptionOnSave = () => {};

  const handlePCategoryOnChange = (event) => {
    if (event.target.value !== "-1") {
      setUntutorial((prevUntutorial) => {
        const updatedCategories = {
          ...prevUntutorial.Categories,
          [event.target.value]: event.target.value,
        };
        return { ...prevUntutorial, Categories: updatedCategories };
      });
    }
  };

  // This useEffect hook will watch for changes in untutorial.Categories
  // and run validation whenever it changes.
  useEffect(() => {
    handleCategoryValidate();
  }, [untutorial.Categories]); // Only re-run the effect if untutorial.Categories changes

  const handleCategoryOnClick = (text) => {
    setUntutorial((prevUntutorial) => {
      const updatedCategories = { ...prevUntutorial.Categories };
      delete updatedCategories[text];
      return { ...prevUntutorial, Categories: updatedCategories };
    });
    handleCategoryValidate();
  };

  const handleCategoryValidate = () => {
    // Now this function is always called after the state has been updated.
    const categoryCount = Object.keys(untutorial.Categories).length;
    if (categoryCount < 1) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        Categories: "At least 1 category required.",
      }));
    } else {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors["Categories"];
        return newErrors;
      });
    }
  };
  const handlePDescriptionOnChange = (value) => {
    setUntutorial((prevUntutorial) => ({
      ...prevUntutorial,
      Description: value,
    }));
  };
  const handlePTitleOnSave = () => {};

  const addStepHandler = () => {
    setUntutorial((prevUntutorial) => ({
      ...prevUntutorial,
      steps: [
        ...prevUntutorial.steps,
        { Description: "", Title: "", DescriptionSp: "" },
      ],
    }));
  };

  const deleteStepHandler = (event, step) => {
    const pCopy = { ...untutorial };
    const newErrors = { ...errors };

    // Delete the step and the corresponding error
    delete pCopy.steps[step];
    delete newErrors["Step" + Object.keys(pCopy.steps).length];

    // Shift steps up
    var newSteps = [];
    var steps = Object.values(pCopy.steps);
    steps.forEach((step, i) => {
      newSteps[i] = step;
    });
    pCopy.steps = newSteps;

    // Update the state
    setUntutorial(pCopy);
    setErrors(newErrors);

    // Call validation function
    handleStepCountValidate();

    console.log("Delete Step");
  };
  const handleStepCountValidate = () => {
    let newErrors = { ...errors }; // Create a shallow copy of errors

    console.log(untutorial.steps.length);
    if (untutorial.steps.length === 0) {
      newErrors["Stepcount"] = "Steps are required.";
    } else if (untutorial.steps.length < -3 /*disabled*/) {
      newErrors["Stepcount"] = "Steps are too short.";
    } else {
      delete newErrors["Stepcount"];
    }

    setErrors(newErrors); // Update the errors state
  };

  // Update the untutorial state with the new steps array
  // setUntutorial(
  //   (prev) => ({
  //     ...prev,
  //     steps: updatedSteps,
  //   }),
  //   () => {
  //     // Call handleStepValidate here if it's refactored to use hooks as well
  //     handleStepValidate(updatedSteps[stepIndex], stepIndex);
  //   }
  // );

  // handleThumbnailUpload converted to use React hooks
  const handleThumbnailUpload = (event) => {
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var pCopy = { ...untutorial }; // copying the state
    pCopy.ThumbnailFilename = uuidv4() + "." + ext;

    var storageRef = firebase.storage.ref(
      "/public/" + pCopy.Author + "/" + pCopy.ThumbnailFilename
    );
    var task = storageRef.put(file);

    task.on(
      "state_changed",
      (snapshot) => {
        // update
        var percentage =
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes;
        setUploadPercent(percentage);
        setUploading(true);
      },
      (error) => {
        // error
        console.log(error);
        setUploadPercent(0);
        setUploading(false);
      },
      () => {
        // complete
        setUntutorial(pCopy);
        setUploadPercent(0);
        setUploading(false);
        handleThumbnailValidate(); // Make sure this function is defined or imported
      }
    );
  };

  const handleThumbnailValidate = () => {
    // const { untutorial, errors } = this.state;
    // if(untutorial.ThumbnailFilename.length === 0){
    // 	errors["Thumbnail"] = 'THUMBNAIL.<span class="red">ISREQUIRED</span>';
    // }
    // else delete errors["Thumbnail"];
    // this.setState({errors:errors});
  };
  const handleStepThumbnailUpload = (event, step) => {
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var pCopy = { ...untutorial }; // creating a copy of the state to modify
    pCopy.steps[step].ThumbnailFilename = uuidv4() + "." + ext;

    var storageRef = firebase.storage.ref(
      "/public/" + pCopy.Author + "/" + pCopy.steps[step].ThumbnailFilename
    );
    var task = storageRef.put(file);

    task.on(
      "state_changed",
      (snapshot) => {
        // update
        var percentage =
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes;
        setUploadPercent(percentage); // updating state using hooks
        setUploading(true); // updating state using hooks
      },
      (error) => {
        // error
        console.log(error);
        setUploadPercent(0); // updating state using hooks
        setUploading(false); // updating state using hooks
      },
      () => {
        // complete
        setUploadPercent(0); // updating state using hooks
        setUploading(false); // updating state using hooks
        setUntutorial(pCopy); // updating state using hooks
      }
    );
  };
  const saveChangesHandler = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Perform validation based on the current state.
    // This function could be called directly or triggered by a useEffect when certain states change.
    const validateBeforeSave = () => {
      let newErrors = {};
      let isValid = true;

      // Validate Title
      if (!untutorial.Title || untutorial.Title.trim() === "") {
        newErrors["Title"] = "Missing Title";
        isValid = false;
      }

      // Validate Description
      if (
        !untutorial.Description ||
        untutorial.Description.trim() === "<p><br></p>"
      ) {
        newErrors["Description"] = "Missing Description";
        isValid = false;
      }

      // Validate Step0
      if (
        !untutorial.steps[0] ||
        !untutorial.steps[0].Description ||
        untutorial.steps[0].Description.trim() === "<p><br></p>"
      ) {
        newErrors["Step0"] = "Step 1 is Required";
        isValid = false;
      }

      // Validate Categories
      if (
        !untutorial.Categories ||
        Object.keys(untutorial.Categories).length === 0
      ) {
        newErrors["Categories"] = "At least 1 category required";
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

    // Call the validation function.
    if (validateBeforeSave()) {
      // If everything is valid, proceed with saving
      try {
        untutorialRef
          .set({ ...untutorial })
          .then(() => {
            console.log("Successfully Saved");
            history.push(ROUTES.LAUNCHPAD + "/" + untutorial.key);
          })
          .catch((error) => console.log(error));
      } catch (err) {
        console.error("Error saving changes: ", err);
      }
    } else {
      // Handle the case where validation fails
      console.log("Validation failed. Errors: ", errors);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <section id="new-project">
      <div className="main">
        <div className="toolbar">
          <button onClick={addStepHandler}>Add Step</button>
          <button onClick={saveChangesHandler}>Save</button>
        </div>
        <div className="main-content">
          {Object.keys(errors).map((error) => (
            <p class="errors">{errors[error]}</p>
          ))}
          <div className="steps">
            {Object.keys(untutorial.steps).map((step) => (
              <div className="step">
                <div className={"step-title status"}>
                  Step {parseInt(step) + 1}
                  {!!untutorial.steps[step] &&
                    !!untutorial.steps[step].Title.length && <>:&nbsp;</>}
                  <TCSEditor
                    disabled={false}
                    type={"plain"}
                    className={"editor header"}
                    onEditorChange={(text) =>
                      handleStepTitleOnChange(text, step)
                    }
                    onEditorSave={handleStepOnSave}
                    placeholder={"Step Title"}
                    buttonText={
                      untutorial.steps[step].Title.length > 0 ? "Edit" : "+"
                    }
                    text={
                      !!untutorial.steps[step].Title
                        ? untutorial.steps[step].Title
                        : ""
                    }
                  />
                </div>
                {Object.keys(untutorial.Categories).includes("ScratchJr") && (
                  <div className="toggleLang">
                    {
                      <a onClick={() => this.setState({ lang: "en" })}>
                        English
                      </a>
                    }
                    {
                      <a onClick={() => this.setState({ lang: "sp" })}>
                        Spanish
                      </a>
                    }
                  </div>
                )}
                <div className="step-content">
                  <TCSEditor
                    disabled={false}
                    onEditorChange={(value) => handleStepOnChange(value, step)}
                    onEditorSave={handleStepOnSave}
                    placeholder={"Step Description"}
                    buttonText={
                      untutorial.steps[step].Description.length > 0
                        ? "Edit Description"
                        : "Add Description"
                    }
                    text={
                      lang === "sp"
                        ? untutorial.steps[step].DescriptionSp
                        : untutorial.steps[step].Description
                    }
                  />
                </div>
                {stepCount > 1 && (
                  <button
                    className="delete"
                    onClick={(event) => deleteStepHandler(event, step)}
                  >
                    Delete
                  </button>
                )}
                <div className="thumbnail">
                  {uploading && <progress value={uploadPercent} max="100" />}
                  <p
                    className={
                      !!untutorial.steps[step].ThumbnailFilename
                        ? "change"
                        : "add"
                    }
                  >
                    {!!untutorial.steps[step].ThumbnailFilename
                      ? "Update Screenshot"
                      : "+ Add Screenshot"}
                  </p>

                  {!!untutorial.steps[step].ThumbnailFilename &&
                    untutorial.steps[step].ThumbnailFilename !== "" &&
                    !uploading && (
                      <LazyImage
                        file={firebase.storage.ref(
                          "/public/" +
                            untutorial.Author +
                            "/" +
                            untutorial.steps[step].ThumbnailFilename
                        )}
                      />
                    )}
                  <label
                    htmlFor={"step" + step + "-thumbnail-upload"}
                    className={
                      !!untutorial.steps[step].ThumbnailFilename
                        ? "replace"
                        : "upload replace"
                    }
                  >
                    <input
                      id={"step" + step + "-thumbnail-upload"}
                      type="file"
                      onChange={(event) => {
                        handleStepThumbnailUpload(event, step);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sidebar">
          <div className="container">
            <h4>
              Title <span className="required">(Required)</span>
            </h4>
            <TCSEditor
              disabled={false}
              type="plain"
              onEditorChange={handlePTitleOnChange}
              onEditorSave={handlePTitleOnSave}
              placeholder={"Untutorial Title"}
              buttonText={untutorial.Title.length > 0 ? "Edit" : "Add"}
              text={untutorial.Title}
            />
          </div>
          <div className="container">
            <h4>
              Description <span className="required">(Required)</span>
            </h4>
            <TCSEditor
              disabled={false}
              type="text"
              onEditorChange={handlePDescriptionOnChange}
              onEditorSave={handlePDescriptionOnSave}
              placeholder={"Project Description"}
              buttonText={untutorial.Description.length > 0 ? "Edit" : "Add"}
              text={untutorial.Description}
            />
          </div>
          <div className="container">
            <h4>Level</h4>
            <TCSEditor
              disabled={false}
              type="select"
              selectOptions={[1, 2, 3, 4, 5, 6, 7]}
              onEditorChange={handleLevelOnChange}
              onEditorSave={handleLevelOnSave}
              text={untutorial.Level}
            />
          </div>
          <div className="container tags">
            <h4>
              Categories <span className="required">(At least 1 Required)</span>
            </h4>
            <div className="filter">
              {Object.keys(untutorial.Categories).length !==
                Object.keys(FILTERS).length && (
                <select onChange={handlePCategoryOnChange}>
                  <option value="-1">-------</option>
                  {Object.keys(FILTERS)
                    .filter(
                      (f) => !Object.keys(untutorial.Categories).includes(f)
                    )
                    .map((catName) => (
                      <option value={catName}>{FILTERS[catName]}</option>
                    ))}
                </select>
              )}
            </div>
            {Object.keys(untutorial.Categories).length > 0 && (
              <div className="filter-categories">
                {Object.keys(untutorial.Categories).map((f) => (
                  <a onClick={() => handleCategoryOnClick(f)}>{FILTERS[f]}</a>
                ))}
              </div>
            )}
          </div>
          <div className="container">
            <div className="thumbnail">
              <h4>
                {untutorial.ThumbnailFilename && !uploading
                  ? "+Replace"
                  : "+ Add"}{" "}
                Image
              </h4>
              {uploading && <progress value={uploadPercent} max="100" />}
              {!!untutorial.ThumbnailFilename &&
                untutorial.ThumbnailFilename !== "" &&
                !uploading && (
                  <LazyImage
                    file={firebase.storage.ref(
                      "/public/" +
                        untutorial.Author +
                        "/" +
                        untutorial.ThumbnailFilename
                    )}
                  />
                )}
              <label for="files" className="upload">
                <input
                  id="files"
                  type="file"
                  onChange={handleThumbnailUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const NewProjectPage = withFirebase(withAuthentication(NewProjectPageBase));

export default NewProjectPage;
