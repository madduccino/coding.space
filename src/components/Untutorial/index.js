import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import LazyImage from "../LazyImage";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import TCSEditor from "../TCSEditor";
import { v4 as uuidv4 } from "uuid";
import * as ROUTES from "../../constants/routes";
import * as FILTERS from "../../constants/filter";
import * as SKILLS from "../../constants/skills";
import { Link } from "react-router-dom";
import "./untutorial.scss";
import { Helmet } from "react-helmet";

const UntutorialPageBase = ({ authUser, firebase, setGlobalState }) => {
  const { key } = useParams();
  const location = useLocation();
  const history = useHistory();

  // State management
  const [state, setState] = useState({
    loading: true,
    untutorial: {},
    errors: {},
    error: null,
    progress: null,
    dirty: false,
    uploading: false,
    uploadPercent: 0,
    showiframe: true,
    lang: authUser ? authUser.lang : "English",
    languageSelect: true,
    init: false,
  });

  // Update state helper
  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Event handlers
  const handleClick = useCallback(
    (e) => {
      if (e.target.className === "iframe-on") {
        updateState({ showiframe: false });
      }
    },
    [updateState]
  );

  const handleMouseEnter = useCallback((target) => {
    // Implementation if needed
  }, []);

  const toggleVisibility = useCallback(() => {
    updateState({ languageSelect: !state.languageSelect });
  }, [state.languageSelect, updateState]);

  // Validation functions
  const validateTitle = useCallback(() => {
    const { untutorial, errors, lang } = state;
    const { Title, TitleEs } = untutorial;
    const newErrors = { ...errors };

    const text = Title ? Title.replace(/<(.|\n)*?>/g, "").trim() : "";
    const textEs = TitleEs ? TitleEs.replace(/<(.|\n)*?>/g, "").trim() : "";

    if (lang === "English") {
      if (text.length === 0) {
        newErrors["Title"] = 'TITLE.<span className="red">ISREQUIRED</span>';
      } else {
        delete newErrors["Title"];
      }
    }
    if (lang === "Español") {
      if (textEs.length === 0) {
        newErrors["TitleEs"] = 'TITLE.<span className="red">ISREQUIRED</span>';
      } else {
        delete newErrors["TitleEs"];
      }
    }
    updateState({ errors: newErrors });
  }, [state, updateState]);

  const validateDescription = useCallback(() => {
    const { untutorial, errors, lang } = state;
    const { Description, DescriptionEs } = untutorial;
    const newErrors = { ...errors };

    if (lang === "English") {
      if (Description === "") {
        newErrors["Description"] = "Description is required.";
      } else {
        delete newErrors["Description"];
      }
    }
    if (lang === "Español") {
      if (DescriptionEs === "") {
        newErrors["DescriptionEs"] = "Description is required.";
      } else {
        delete newErrors["DescriptionEs"];
      }
    }
    updateState({ errors: newErrors });
  }, [state, updateState]);

  const validateStatus = useCallback(() => {
    const { untutorial, errors } = state;
    const { Status } = untutorial;
    const newErrors = { ...errors };

    if (!["DRAFT", "APPROVED"].includes(Status)) {
      newErrors["Status"] = 'STATUS.<span className="red">ISINVALID</span>';
    } else {
      delete newErrors["Status"];
    }
    updateState({ errors: newErrors });
  }, [state, updateState]);

  const validateLevel = useCallback(() => {
    const { untutorial, errors } = state;
    const { Level } = untutorial;
    const newErrors = { ...errors };

    if (isNaN(Level)) {
      newErrors["Level"] = 'LEVEL.<span className="red">ISINVALID</span>';
    }
    if (![1, 2, 3, 4, 5, 6, 7].includes(parseInt(Level))) {
      newErrors["Level"] = 'LEVEL.<span className="red">ISOUTSIDERANGE</span>';
    } else {
      delete newErrors["Level"];
    }
    updateState({ errors: newErrors });
  }, [state, updateState]);

  const validatePriority = useCallback(() => {
    const { untutorial, errors } = state;
    const { Priority } = untutorial;
    const newErrors = { ...errors };

    if (isNaN(Priority)) {
      newErrors["Priority"] = 'PRIORITY.<span className="red">ISINVALID</span>';
    }
    if (
      ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(
        parseInt(Priority)
      )
    ) {
      newErrors["Priority"] =
        'PRIORITY.<span className="red">ISOUTSIDERANGE</span>';
    } else {
      delete newErrors["Priority"];
    }
    updateState({ errors: newErrors });
  }, [state, updateState]);

  const validateStep = useCallback(
    (index) => {
      const { untutorial, errors } = state;
      const Step = untutorial.steps[index];
      const newErrors = { ...errors };
      const text = Step.Description.replace(/<(.|\n)*?>/g, "").trim();

      if (text === "") {
        newErrors[
          "STEP" + index
        ] = `STEP.<span className="orange">${index}</span>.<span className="red">ISREQUIRED</span>`;
      }
      if (text.length < 20) {
        newErrors[
          "STEP" + index
        ] = `STEP.<span className="orange">${index}</span>.<span className="red">ISTOOSHORT</span>`;
      } else {
        delete newErrors["STEP" + index];
      }
      updateState({ errors: newErrors });
    },
    [state, updateState]
  );

  // Save functions
  const saveChangesHandler = useCallback(() => {
    const { untutorial, errors } = state;

    if (Object.values(errors).length === 0) {
      const updatedUntutorial = {
        ...untutorial,
        LastModified: Date.now(),
        Author: untutorial.Author.key,
      };

      firebase
        .untutorial(key)
        .set(updatedUntutorial)
        .then(() => {
          console.log("Successfully Saved");
          updateState({ dirty: false });
        })
        .catch((error) => updateState({ error: error.message }));
    }
  }, [state, firebase, key, updateState]);

  const saveProgressHandler = useCallback(() => {
    const { untutorial, errors, progress } = state;

    if (Object.values(errors).length === 0) {
      const updatedProgress = {
        ...progress,
        LastModified: Date.now(),
      };

      firebase
        .progress(authUser.uid, untutorial.key)
        .set(updatedProgress)
        .then(() => {
          console.log("Successfully Saved Progress");
        })
        .catch((error) => console.log(error));
    } else {
      const badFields = Object.keys(errors);
      const messages = badFields.map((field) => ({
        html: errors[field],
        type: true,
      }));

      messages.push({
        html: "Press any key to continue...",
        type: false,
      });

      setGlobalState({
        messages: messages,
        showMessage: true,
      });
    }
  }, [state, firebase, authUser, setGlobalState]);

  // Content change handlers
  const handleTitleOnChange = useCallback(
    (value) => {
      const { untutorial, lang } = state;
      const updatedUntutorial = { ...untutorial };

      if (lang === "Español") {
        if (value !== updatedUntutorial.TitleEs) {
          updatedUntutorial.TitleEs = value;
        }
      } else {
        if (value !== updatedUntutorial.Title) {
          updatedUntutorial.Title = value;
        }
        if (authUser && authUser.roles["STUDENT"]) {
          updatedUntutorial.Status = "DRAFT";
        }
        updateState({ untutorial: updatedUntutorial, dirty: true });
        setTimeout(validateTitle, 0);
      }
    },
    [state, authUser, updateState, validateTitle]
  );

  const handleDescriptionOnChange = useCallback(
    (value) => {
      const { untutorial, lang } = state;
      const updatedUntutorial = { ...untutorial };

      if (lang === "Español") {
        if (value !== updatedUntutorial.DescriptionEs) {
          updatedUntutorial.DescriptionEs = value;
        }
      } else {
        if (value !== updatedUntutorial.Description) {
          updatedUntutorial.Description = value;
        }
      }

      if (authUser && authUser.roles["STUDENT"]) {
        updatedUntutorial.Status = "DRAFT";
      }

      updateState({ untutorial: updatedUntutorial, dirty: true });
      setTimeout(validateDescription, 0);
    },
    [state, authUser, updateState, validateDescription]
  );

  const handleStatusOnChange = useCallback(
    (value) => {
      const { untutorial } = state;
      if (value !== untutorial.Status) {
        const updatedUntutorial = { ...untutorial, Status: value };
        updateState({ untutorial: updatedUntutorial, dirty: true });
        setTimeout(validateStatus, 0);
      }
    },
    [state, updateState, validateStatus]
  );

  const handleLevelOnChange = useCallback(
    (value) => {
      const { untutorial } = state;
      if (value !== untutorial.Level) {
        const updatedUntutorial = { ...untutorial, Level: value };
        if (authUser && authUser.roles["STUDENT"]) {
          updatedUntutorial.Status = "DRAFT";
        }
        updateState({ untutorial: updatedUntutorial, dirty: true });
        setTimeout(validateLevel, 0);
      }
    },
    [state, authUser, updateState, validateLevel]
  );

  const handlePriorityOnChange = useCallback(
    (value) => {
      const { untutorial } = state;
      if (value !== untutorial.Priority) {
        const updatedUntutorial = { ...untutorial, Priority: value };
        if (authUser && authUser.roles["STUDENT"]) {
          updatedUntutorial.Status = "DRAFT";
        }
        updateState({ untutorial: updatedUntutorial, dirty: true });
        setTimeout(validatePriority, 0);
      }
    },
    [state, authUser, updateState, validatePriority]
  );

  // Step handlers
  const handleStepTitleOnChange = useCallback(
    (value, step) => {
      const { untutorial, lang } = state;
      const updatedUntutorial = { ...untutorial };

      if (value !== updatedUntutorial.steps[step].Title) {
        if (lang === "Español") {
          updatedUntutorial.steps[step].TitleEs = value;
        } else {
          updatedUntutorial.steps[step].Title = value;
        }

        if (authUser && authUser.roles["STUDENT"]) {
          updatedUntutorial.Status = "DRAFT";
        }

        updateState({ untutorial: updatedUntutorial, dirty: true });
      }
    },
    [state, authUser, updateState]
  );

  const handleStepOnChange = useCallback(
    (value, step) => {
      const { untutorial, lang } = state;
      const updatedUntutorial = { ...untutorial };

      if (
        lang === "Español" &&
        value !== updatedUntutorial.steps[step].DescriptionEs
      ) {
        updatedUntutorial.steps[step].DescriptionEs = value;
      }

      if (value !== updatedUntutorial.steps[step].Description) {
        updatedUntutorial.steps[step].Description = value;
      }

      if (authUser && authUser.roles["STUDENT"]) {
        updatedUntutorial.Status = "DRAFT";
      }

      updateState({ untutorial: updatedUntutorial, dirty: true });
    },
    [state, authUser, updateState]
  );

  const addStepHandler = useCallback(() => {
    const { untutorial } = state;
    const updatedUntutorial = { ...untutorial };

    if (authUser && authUser.roles["STUDENT"]) {
      updatedUntutorial.Status = "DRAFT";
    }

    updatedUntutorial.steps[
      Math.max(...Object.keys(updatedUntutorial.steps)) + 1
    ] = {
      Description: "",
    };

    updateState({ untutorial: updatedUntutorial, dirty: true });
    setTimeout(saveChangesHandler, 0);
  }, [state, authUser, updateState, saveChangesHandler]);

  const deleteStepHandler = useCallback(
    (event, stepKey) => {
      const { untutorial } = state;
      const updatedUntutorial = { ...untutorial };

      if (authUser && authUser.roles["STUDENT"]) {
        updatedUntutorial.Status = "DRAFT";
      }

      delete updatedUntutorial.steps[stepKey];

      // Shift steps up
      const newSteps = [];
      const steps = Object.values(updatedUntutorial.steps);
      steps.forEach((step, i) => {
        newSteps[i] = step;
      });
      updatedUntutorial.steps = newSteps;

      updateState({ untutorial: updatedUntutorial, dirty: true });
      setTimeout(saveChangesHandler, 0);
    },
    [state, authUser, updateState, saveChangesHandler]
  );

  // Upload handlers
  const handleThumbnailUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf(".") + 1);
      const { untutorial } = state;
      const updatedUntutorial = { ...untutorial };

      if (authUser && authUser.roles["STUDENT"]) {
        updatedUntutorial.Status = "DRAFT";
      }

      updatedUntutorial.ThumbnailFilename = uuidv4() + "." + ext;

      const storageRef = firebase.storage.ref(
        "/public/" +
          updatedUntutorial.Author.key +
          "/" +
          updatedUntutorial.ThumbnailFilename
      );
      const task = storageRef.put(file);

      task.on(
        "state_changed",
        (snapshot) => {
          const percentage =
            (100 * snapshot.bytesTransferred) / snapshot.totalBytes;
          updateState({ uploadPercent: percentage, uploading: true });
        },
        (error) => {
          updateState({ uploadPercent: 0, uploading: false });
        },
        () => {
          updateState({
            uploadPercent: 0,
            uploading: false,
            untutorial: updatedUntutorial,
            dirty: true,
          });
          setTimeout(saveChangesHandler, 0);
        }
      );
    },
    [state, authUser, firebase, updateState, saveChangesHandler]
  );

  const handleStepThumbnailUpload = useCallback(
    (event, step) => {
      const { lang, untutorial } = state;
      const file = event.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf(".") + 1);
      const updatedUntutorial = { ...untutorial };

      if (authUser && authUser.roles["STUDENT"]) {
        updatedUntutorial.Status = "DRAFT";
      }

      let storageRef;
      if (lang === "Español") {
        updatedUntutorial.steps[step].ThumbnailFilenameSp =
          uuidv4() + "." + ext;
        storageRef = firebase.storage.ref(
          "/public/" +
            updatedUntutorial.Author.key +
            "/" +
            updatedUntutorial.steps[step].ThumbnailFilenameSp
        );
      } else {
        updatedUntutorial.steps[step].ThumbnailFilename = uuidv4() + "." + ext;
        storageRef = firebase.storage.ref(
          "/public/" +
            updatedUntutorial.Author.key +
            "/" +
            updatedUntutorial.steps[step].ThumbnailFilename
        );
      }

      const task = storageRef.put(file);

      task.on(
        "state_changed",
        (snapshot) => {
          const percentage =
            (100 * snapshot.bytesTransferred) / snapshot.totalBytes;
          updateState({ uploadPercent: percentage, uploading: true });
        },
        (error) => {
          console.log(error);
          updateState({ uploadPercent: 0, uploading: false });
        },
        () => {
          updateState({
            uploadPercent: 0,
            uploading: false,
            untutorial: updatedUntutorial,
            dirty: true,
          });
          setTimeout(saveChangesHandler, 0);
        }
      );
    },
    [state, authUser, firebase, updateState, saveChangesHandler]
  );

  // Category and skills handlers
  const handleSkillsOnChange = useCallback(
    (event) => {
      const { untutorial } = state;
      if (event.target.value !== "-1") {
        const updatedUntutorial = { ...untutorial };
        updatedUntutorial.Skills[event.target.value] = event.target.value;
        updateState({ untutorial: updatedUntutorial });
        handleSkillsValidate();
      }
    },
    [state, updateState]
  );

  const handleSkillsOnClick = useCallback(
    (text) => {
      const { untutorial } = state;
      const updatedUntutorial = { ...untutorial };
      delete updatedUntutorial.Skills[text];
      updateState({ untutorial: updatedUntutorial });
      handleSkillsValidate();
    },
    [state, updateState]
  );

  const handleSkillsValidate = useCallback(() => {
    const { untutorial } = state;
    try {
      if (Object.keys(untutorial.Skills).length < 1) {
        throw "At least one skill required";
      } else {
        saveChangesHandler();
        updateState({ error: "" });
      }
    } catch (error) {
      updateState({ error: error });
    }
  }, [state, updateState, saveChangesHandler]);

  const handlePCategoryOnChange = useCallback(
    (event) => {
      const { untutorial } = state;
      if (event.target.value !== "-1") {
        const updatedUntutorial = { ...untutorial };
        updatedUntutorial.Categories[event.target.value] = event.target.value;
        updateState({ untutorial: updatedUntutorial });
        handleCategoryValidate();
      }
    },
    [state, updateState]
  );

  const handleCategoryOnClick = useCallback(
    (text) => {
      const { untutorial } = state;
      const updatedUntutorial = { ...untutorial };
      delete updatedUntutorial.Categories[text];
      updateState({ untutorial: updatedUntutorial });
      handleCategoryValidate();
    },
    [state, updateState]
  );

  const handleCategoryValidate = useCallback(() => {
    const { untutorial } = state;
    try {
      if (Object.keys(untutorial.Categories).length < 1) {
        throw "At least one category required";
      } else {
        saveChangesHandler();
        updateState({ error: "" });
      }
    } catch (error) {
      updateState({ error: error });
    }
  }, [state, updateState, saveChangesHandler]);

  // Progress handlers
  const handleProgressURLOnChange = useCallback(
    (value) => {
      const { progress } = state;
      const updatedProgress = { ...progress, URL: value };
      updateState({ progress: updatedProgress });
    },
    [state, updateState]
  );

  const loadProgress = useCallback(() => {
    const { untutorial, showiframe } = state;

    if (authUser) {
      firebase
        .progress(authUser.uid, untutorial.key)
        .on("value", (snapshot) => {
          if (snapshot.exists()) {
            let progress = snapshot.val();
            if (!progress.steps) progress.steps = [];
            updateState({ progress: progress });
          } else {
            let progress = {
              Status: "DRAFT",
              steps: [],
              LastModified: Date.now(),
              profile: authUser.uid,
              untut: key,
              url: "",
            };
            untutorial.steps.forEach((step, i) => {
              progress.steps.push({ Status: "DRAFT", Comments: "" });
            });
            snapshot.ref.set({ ...progress }).then(() => {
              updateState({ progress: progress });
            });
          }
        });
    }

    if (showiframe) updateState({ showiframe: false });
  }, [state, authUser, firebase, key, updateState]);

  const studentApprove = useCallback(
    (step) => {
      const { progress } = state;
      const updatedProgress = { ...progress };

      if (!progress.steps[step]) {
        progress.steps[step] = { Status: "PENDING", Comments: "" };
      }
      progress.steps[step].Status = "PENDING";

      updateState({ progress: updatedProgress });
      setTimeout(saveProgressHandler, 0);
    },
    [state, updateState, saveProgressHandler]
  );

  const deleteProjectHandler = useCallback(() => {
    firebase.untutorial(key).remove();
    window.location = ROUTES.LANDING;
  }, [firebase, key]);

  const chooseLang = useCallback(
    (event) => {
      updateState({ lang: event.target.value });
      if (authUser) {
        firebase.profile(authUser.uid + "/lang").set(event.target.value);
      }
    },
    [authUser, firebase, updateState]
  );

  // Effects
  useEffect(() => {
    document.body.addEventListener("click", handleClick);
    return () => document.body.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    firebase.untutorial(key).on("value", (snapshot) => {
      const untutorial = snapshot.val();
      firebase
        .profile(untutorial.Author)
        .once("value")
        .then((snapshot2) => {
          const author = snapshot2.val();
          untutorial.Author = author;
          updateState({
            untutorial: untutorial,
            loading: false,
          });

          if (location.search.includes("loadProgress")) {
            loadProgress();
          }
        });
    });

    return () => firebase.untutorial().off();
  }, [firebase, key, location.search, loadProgress, updateState]);

  useEffect(() => {
    const { lang, init } = state;
    if (authUser && !init && lang !== authUser.lang) {
      updateState({ init: true, lang: authUser.lang });
    }
  }, [authUser, state, updateState]);

  // Render
  const { untutorial, loading, progress, showiframe, error, lang } = state;
  const { Title, Description, Level, steps } = untutorial;

  let progressSteps = null;
  if (progress) progressSteps = progress.steps;
  let stepCount = 0;
  if (untutorial && untutorial.steps) stepCount = untutorial.steps.length;
  let nextStep = -1;
  if (progress) nextStep = progress.nextStep;
  if (nextStep > stepCount) nextStep = 0;

  if (loading) return <div className="loading">Loading ...</div>;

  return (
    <section id="untutorial">
      <Helmet>
        <title>{`${
          authUser
            ? `${authUser.Username.replace(/\./g, " ").replace(/\w\S*/g, (w) =>
                w.replace(/^\w/, (c) => c.toUpperCase())
              )} - ${untutorial.Title.replace(/<(.|\n)*?>/g, "").trim()}`
            : untutorial.Title.replace(/<(.|\n)*?>/g, "").trim()
        }`}</title>
      </Helmet>

      <div className="toggleLang">
        <a onClick={toggleVisibility}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-globe"
            viewBox="0 0 16 16"
          >
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z" />
          </svg>
        </a>
        <select value={lang} onChange={chooseLang}>
          <option value={lang}>{lang}</option>
          <option value={lang === "English" ? "Español" : "English"}>
            {lang === "English" ? "Español" : "English"}
          </option>
        </select>
      </div>

      <div className={showiframe ? "iframe-on" : "iframe-off"}>
        <div className="popup">
          {showiframe && (
            <>
              <div>
                <h3
                  dangerouslySetInnerHTML={{
                    __html:
                      lang === "Español" && untutorial.TitleEs
                        ? untutorial.TitleEs
                        : untutorial.Title,
                  }}
                />
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      lang === "Español" && untutorial.DescriptionEs
                        ? untutorial.DescriptionEs
                        : untutorial.Description,
                  }}
                />
                <button onClick={loadProgress}>Code This Project</button>
              </div>
              <a className="back" onClick={() => history.goBack()}>
                Back
              </a>
              <a
                className="close"
                onClick={() =>
                  updateState({ showiframe: false, progress: null })
                }
              >
                <i className="fa fa-close"></i>
              </a>
            </>
          )}
          <div
            onClick={() => updateState({ showiframe: !showiframe })}
            className="toggle-iframe"
          >
            <i className="fa fa-code"></i>
          </div>
        </div>
      </div>

      <div className={`thumbnail hero ${showiframe ? "blur" : ""}`}>
        {authUser &&
          (authUser.roles["ADMIN"] ||
            authUser.uid === untutorial.Author.key) && (
            <label htmlFor="files" className="upload">
              <input id="files" type="file" onChange={handleThumbnailUpload} />
            </label>
          )}
        {state.uploading && <progress value={state.uploadPercent} max="100" />}
        {untutorial.ThumbnailFilename &&
          untutorial.ThumbnailFilename.length !== 0 &&
          !state.uploading && (
            <LazyImage
              file={firebase.storage.ref(
                "/public/" +
                  untutorial.Author.key +
                  "/" +
                  untutorial.ThumbnailFilename
              )}
            />
          )}
      </div>

      <div className="workOnProject">
        {progress && progress.Status === "APPROVED" && (
          <h3>
            GREAT JOB! You finished this project!{" "}
            <Link to={ROUTES.UNIVERSE + "/" + progress.untut}>
              Publish to the UNIVERSE!
            </Link>
          </h3>
        )}
        {progress && progress.Status === "PENDING" && (
          <h3>Your teacher is reviewing your project!</h3>
        )}
        {progress && progress.Status === "DRAFT" && nextStep > 0 && (
          <h3>Keep it Up! You're on Step {nextStep}!</h3>
        )}
        {error && <h3>{error}</h3>}
      </div>

      <div className={`main ${showiframe ? "blur" : ""}`}>
        <div className="main-content">
          <div className="top">
            <a className="back" onClick={() => history.goBack()}>
              <i className="fa fa-backward"></i>
            </a>

            {progress && (
              <TCSEditor
                disabled={false}
                type={"plain"}
                className="url"
                onEditorChange={handleProgressURLOnChange}
                onEditorSave={saveProgressHandler}
                placeholder={"http://"}
                url={true}
                buttonText={progress.URL ? "Edit Link" : "Add Link"}
                text={progress.URL}
              />
            )}
          </div>

          <div className="steps">
            {untutorial &&
              untutorial.steps.map((step, index) => (
                <div
                  key={index}
                  className={
                    "step " +
                    (progress && progress.steps[index]?.Status === "PENDING"
                      ? ""
                      : "")
                  }
                >
                  <div className="checkOff">
                    <div className={"step-title status"}>
                      <p>
                        {lang === "Español"
                          ? `Paso ${index + 1}`
                          : `Step ${index + 1}`}
                        {step.Title && step.Title.length && <>:</>}
                      </p>

                      <TCSEditor
                        disabled={
                          !(
                            authUser &&
                            (authUser.roles["ADMIN"] ||
                              authUser.uid === untutorial.Author.key)
                          )
                        }
                        type={"plain"}
                        className="header"
                        onEditorChange={(value) =>
                          handleStepTitleOnChange(value, index)
                        }
                        onEditorSave={(value) => saveChangesHandler()}
                        placeholder={"Step Title"}
                        buttonText={progress ? "" : "Edit Title"}
                        text={
                          lang === "Español" && untutorial.steps[index].TitleEs
                            ? untutorial.steps[index].TitleEs
                            : untutorial.steps[index].Title
                        }
                      />
                    </div>
                  </div>

                  <div className={"step-content"}>
                    <TCSEditor
                      disabled={
                        !(
                          authUser &&
                          (authUser.roles["ADMIN"] ||
                            authUser.uid === untutorial.Author.key)
                        )
                      }
                      type={"text"}
                      className={progress ? "no-button" : "editor"}
                      onEditorChange={(value) =>
                        handleStepOnChange(value, index)
                      }
                      onEditorSave={(value) => saveChangesHandler()}
                      placeholder={"Step Description"}
                      buttonText={progress ? "" : "Edit Description"}
                      text={
                        lang === "Español" &&
                        untutorial.steps[index].DescriptionEs
                          ? untutorial.steps[index].DescriptionEs
                          : untutorial.steps[index].Description
                      }
                    />

                    {progress &&
                      progress.steps[index] &&
                      progress.steps[index].Comments !== "" && (
                        <div className={"comments"}>
                          <h4>Teacher comments:</h4>{" "}
                          {progress.steps[index].Comments}
                        </div>
                      )}

                    <div
                      className={
                        untutorial.steps[index].ThumbnailFilename
                          ? "thumbnail crop"
                          : "thumbnail"
                      }
                    >
                      {authUser &&
                        (authUser.roles["ADMIN"] ||
                          authUser.uid === untutorial.Author.key) && (
                          <>
                            <p
                              className={
                                untutorial.steps[index].ThumbnailFilename
                                  ? "change"
                                  : "add"
                              }
                            >
                              {untutorial.steps[index].ThumbnailFilename
                                ? "Update Screenshot"
                                : "+ Add Screenshot"}
                            </p>
                            <label
                              htmlFor={"step" + index + "-thumbnail-upload"}
                              className={
                                untutorial.steps[index].ThumbnailFilename
                                  ? "upload replace"
                                  : "upload"
                              }
                            >
                              <input
                                id={"step" + index + "-thumbnail-upload"}
                                type="file"
                                onChange={(event) =>
                                  handleStepThumbnailUpload(event, index)
                                }
                              />
                            </label>
                          </>
                        )}

                      {state.uploading && (
                        <progress value={state.uploadPercent} max="100" />
                      )}

                      {untutorial.steps[index].ThumbnailFilename &&
                        untutorial.steps[index].ThumbnailFilename.length !==
                          0 &&
                        !state.uploading &&
                        (lang === "English" ||
                          !untutorial.steps[index].ThumbnailFilenameSp) && (
                          <LazyImage
                            id={"step" + index + "-thumbnail"}
                            className="crop"
                            file={firebase.storage.ref(
                              "/public/" +
                                untutorial.Author.key +
                                "/" +
                                untutorial.steps[index].ThumbnailFilename
                            )}
                          />
                        )}

                      {authUser &&
                        (authUser.roles["ADMIN"] ||
                          authUser.uid === untutorial.Author.key) &&
                        lang === "Español" && (
                          <>
                            <p
                              className={
                                untutorial.steps[index].ThumbnailFilename
                                  ? "change"
                                  : "add"
                              }
                            >
                              {untutorial.steps[index].ThumbnailFilename
                                ? "Update Screenshot"
                                : "+ Add Screenshot"}
                            </p>
                            <label
                              htmlFor={"step" + index + "-thumbnail-upload"}
                              className={
                                untutorial.steps[index].ThumbnailFilename
                                  ? "upload replace"
                                  : "upload"
                              }
                            >
                              <input
                                id={"step" + index + "-thumbnail-upload"}
                                type="file"
                                onChange={(event) =>
                                  handleStepThumbnailUpload(event, index)
                                }
                              />
                            </label>
                          </>
                        )}

                      {untutorial.steps[index].ThumbnailFilenameSp &&
                        untutorial.steps[index].ThumbnailFilenameSp.length !==
                          0 &&
                        !state.uploading &&
                        lang === "Español" && (
                          <LazyImage
                            id={"step" + index + "-thumbnail"}
                            className="crop"
                            file={firebase.storage.ref(
                              "/public/" +
                                untutorial.Author.key +
                                "/" +
                                untutorial.steps[index].ThumbnailFilenameSp
                            )}
                          />
                        )}
                    </div>

                    {progress &&
                      (!progress.steps[index] ||
                        progress.steps[index].Status === "DRAFT") && (
                        <button
                          disabled={false}
                          className={"done-button todo"}
                          onClick={() => studentApprove(index)}
                        >
                          Mark Done
                        </button>
                      )}
                    {progress &&
                      progress.steps[index] &&
                      progress.steps[index].Status === "PENDING" && (
                        <div className="done-button pending">In Review</div>
                      )}
                    {progress &&
                      progress.steps[index] &&
                      progress.steps[index].Status === "APPROVED" && (
                        <div className="done-button approved">Approved</div>
                      )}
                  </div>

                  {stepCount > 1 &&
                    authUser &&
                    (authUser.roles["ADMIN"] ||
                      authUser.uid === untutorial.Author.key) && (
                      <button
                        className="del"
                        onClick={(event) => deleteStepHandler(event, index)}
                      >
                        Delete Step
                      </button>
                    )}
                </div>
              ))}

            {authUser &&
              (authUser.roles["ADMIN"] ||
                authUser.uid === untutorial.Author.key) && (
                <div className="addDelete">
                  <button onClick={addStepHandler}>Add Step</button>
                  <button onClick={deleteProjectHandler}>
                    Delete Untutorial
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="sidebar">
          <>
            {untutorial.Categories?.["SCRATCH"] && (
              <a
                className="scratch"
                href="https://scratch.mit.edu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LazyImage file={firebase.storage.ref("/public/scratch.png")} />
              </a>
            )}
            {untutorial.Categories?.["WOOF"] && (
              <a
                className="scratch"
                href="https://woofjs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LazyImage file={firebase.storage.ref("/public/woof.png")} />
              </a>
            )}
            {untutorial.Categories?.["WEB"] && (
              <button
                style={{ padding: "10px", marginBottom: "30px" }}
                onClick={() =>
                  window.open(
                    "/v1/web/reference-guide.html",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Web Reference Guide
              </button>
            )}
          </>

          <div className="container">
            <div className={"titleStatus"}>
              <TCSEditor
                disabled={
                  !(
                    authUser &&
                    (authUser.roles["ADMIN"] ||
                      authUser.uid === untutorial.Author.key)
                  )
                }
                type={"text"}
                className={"title"}
                name={"title"}
                onEditorChange={handleTitleOnChange}
                onEditorSave={saveChangesHandler}
                placeholder={"Step Description"}
                text={
                  lang === "Español" && untutorial.TitleEs
                    ? untutorial.TitleEs
                    : untutorial.Title
                }
              />
            </div>
          </div>

          <div className="container">
            Level:
            <TCSEditor
              disabled={
                !(
                  authUser &&
                  (authUser.roles["ADMIN"] ||
                    authUser.uid === untutorial.Author.key)
                )
              }
              type={"select"}
              className="level"
              selectOptions={["1", "2", "3", "4", "5", "6", "7"]}
              onEditorChange={handleLevelOnChange}
              onEditorSave={saveChangesHandler}
              placeholder={"Level"}
              text={untutorial.Level}
            />
          </div>

          {authUser && authUser.roles["ADMIN"] && (
            <div className="container">
              Priority:
              <TCSEditor
                disabled={false}
                type={"select"}
                className="priority"
                selectOptions={[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                  "13",
                  "14",
                  "15",
                ]}
                onEditorChange={handlePriorityOnChange}
                onEditorSave={saveChangesHandler}
                placeholder={"Priority"}
                text={untutorial.Priority}
              />
            </div>
          )}

          <div className="container">
            <h3>
              by:{" "}
              <a
                href={"/profile/" + untutorial.Author.key}
                dangerouslySetInnerHTML={{
                  __html: untutorial.Author.DisplayName,
                }}
              />
            </h3>
          </div>

          <div className="container">
            <TCSEditor
              disabled={
                !(
                  authUser &&
                  (authUser.roles["ADMIN"] ||
                    authUser.uid === untutorial.Author.key)
                )
              }
              type={"text"}
              onEditorChange={handleDescriptionOnChange}
              onEditorSave={saveChangesHandler}
              placeholder={"Untutorial Description"}
              name={"description"}
              text={
                lang === "Español" && untutorial.DescriptionEs
                  ? untutorial.DescriptionEs
                  : untutorial.Description
              }
            />
          </div>

          {authUser &&
            (authUser.roles["ADMIN"] ||
              authUser.uid === untutorial.Author.key) && (
              <div className="container">
                <h4>Status</h4>
                <TCSEditor
                  disabled={!(authUser && authUser.roles["ADMIN"])}
                  type={"select"}
                  selectOptions={["DRAFT", "APPROVED"]}
                  name={"status"}
                  className={
                    untutorial.Status === "APPROVED" ? "approved" : "draft"
                  }
                  onEditorChange={handleStatusOnChange}
                  onEditorSave={saveChangesHandler}
                  placeholder={"Status"}
                  text={untutorial.Status}
                />
              </div>
            )}

          {authUser &&
            (authUser.roles["ADMIN"] ||
              authUser.uid === untutorial.Author.key) && (
              <div className="container">
                <h4>Category</h4>
                <div className="filter">
                  {Object.keys(untutorial.Categories || {}).length !==
                    Object.keys(FILTERS).length && (
                    <select onChange={handlePCategoryOnChange}>
                      <option value="-1">-------</option>
                      {Object.keys(FILTERS)
                        .filter(
                          (f) =>
                            !Object.keys(untutorial.Categories || {}).includes(
                              f
                            )
                        )
                        .map((catName) => (
                          <option key={catName} value={catName}>
                            {FILTERS[catName]}
                          </option>
                        ))}
                    </select>
                  )}

                  <div className="filter-categories">
                    {Object.keys(untutorial.Categories || {}).map((f) => (
                      <a key={f} onClick={() => handleCategoryOnClick(f)}>
                        {FILTERS[f]}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

const UntutorialPage = withFirebase(withAuthentication(UntutorialPageBase));

export default UntutorialPage;
