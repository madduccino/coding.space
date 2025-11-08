import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

  // Split state into logical pieces to avoid unnecessary re-renders
  const [loading, setLoading] = useState(true);
  const [untutorial, setUntutorial] = useState({});
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [showiframe, setShowiframe] = useState(true);
  const [lang, setLang] = useState(authUser ? authUser.lang : "English");
  const [languageSelect, setLanguageSelect] = useState(true);
  const [init, setInit] = useState(false);

  // Use refs to avoid recreating callbacks
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  // Helper function to validate fields
  const validateField = useCallback((field, value, lang) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      switch (field) {
        case "Title":
        case "TitleEs": {
          const text = value ? value.replace(/<(.|\n)*?>/g, "").trim() : "";
          if (text.length === 0) {
            newErrors[field] = 'TITLE.<span className="red">ISREQUIRED</span>';
          } else {
            delete newErrors[field];
          }
          break;
        }
        case "Description":
        case "DescriptionEs": {
          if (value === "") {
            newErrors[field] = "Description is required.";
          } else {
            delete newErrors[field];
          }
          break;
        }
        case "Status": {
          if (!["DRAFT", "APPROVED"].includes(value)) {
            newErrors[field] = 'STATUS.<span className="red">ISINVALID</span>';
          } else {
            delete newErrors[field];
          }
          break;
        }
        case "Level": {
          if (isNaN(value)) {
            newErrors[field] = 'LEVEL.<span className="red">ISINVALID</span>';
          } else if (![1, 2, 3, 4, 5, 6, 7].includes(parseInt(value))) {
            newErrors[field] = 'LEVEL.<span className="red">ISOUTSIDERANGE</span>';
          } else {
            delete newErrors[field];
          }
          break;
        }
        case "Priority": {
          if (isNaN(value)) {
            newErrors[field] = 'PRIORITY.<span className="red">ISINVALID</span>';
          } else if (
            ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(parseInt(value))
          ) {
            newErrors[field] = 'PRIORITY.<span className="red">ISOUTSIDERANGE</span>';
          } else {
            delete newErrors[field];
          }
          break;
        }
        default:
          if (field.startsWith("STEP")) {
            const text = value.replace(/<(.|\n)*?>/g, "").trim();
            const index = field.replace("STEP", "");
            if (text === "") {
              newErrors[field] = `STEP.<span className="orange">${index}</span>.<span className="red">ISREQUIRED</span>`;
            } else if (text.length < 20) {
              newErrors[field] = `STEP.<span className="orange">${index}</span>.<span className="red">ISTOOSHORT</span>`;
            } else {
              delete newErrors[field];
            }
          }
          break;
      }

      return newErrors;
    });
  }, []);

  // Save functions
  const saveChangesHandler = useCallback(() => {
    if (Object.values(errorsRef.current).length === 0) {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = {
          ...currentUntutorial,
          LastModified: Date.now(),
          Author: currentUntutorial.Author.key,
        };

        firebase
          .untutorial(key)
          .set(updatedUntutorial)
          .then(() => {
            console.log("Successfully Saved");
            setDirty(false);
          })
          .catch((error) => setError(error.message));

        return updatedUntutorial;
      });
    }
  }, [firebase, key]);

  const saveProgressHandler = useCallback(() => {
    if (Object.values(errorsRef.current).length === 0) {
      setProgress((currentProgress) => {
        const updatedProgress = {
          ...currentProgress,
          LastModified: Date.now(),
        };

        firebase
          .progress(authUser.uid, untutorial.key)
          .set(updatedProgress)
          .then(() => {
            console.log("Successfully Saved Progress");
          })
          .catch((error) => console.log(error));

        return updatedProgress;
      });
    } else {
      const badFields = Object.keys(errorsRef.current);
      const messages = badFields.map((field) => ({
        html: errorsRef.current[field],
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
  }, [firebase, authUser, untutorial.key, setGlobalState]);

  // Event handlers
  const handleClick = useCallback((e) => {
    if (e.target.className === "iframe-on") {
      setShowiframe(false);
    }
  }, []);

  const toggleVisibility = useCallback(() => {
    setLanguageSelect((prev) => !prev);
  }, []);

  // Content change handlers - FIXED to update state in all cases
  const handleTitleOnChange = useCallback(
    (value) => {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };
        let hasChanged = false;

        if (lang === "Español") {
          if (value !== updatedUntutorial.TitleEs) {
            updatedUntutorial.TitleEs = value;
            hasChanged = true;
            validateField("TitleEs", value, lang);
          }
        } else {
          if (value !== updatedUntutorial.Title) {
            updatedUntutorial.Title = value;
            hasChanged = true;
            validateField("Title", value, lang);
          }
        }

        if (hasChanged) {
          if (authUser && authUser.roles["STUDENT"]) {
            updatedUntutorial.Status = "DRAFT";
          }
          setDirty(true);
        }

        return hasChanged ? updatedUntutorial : currentUntutorial;
      });
    },
    [authUser, lang, validateField]
  );

  const handleDescriptionOnChange = useCallback(
    (value) => {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };
        let hasChanged = false;

        if (lang === "Español") {
          if (value !== updatedUntutorial.DescriptionEs) {
            updatedUntutorial.DescriptionEs = value;
            hasChanged = true;
            validateField("DescriptionEs", value, lang);
          }
        } else {
          if (value !== updatedUntutorial.Description) {
            updatedUntutorial.Description = value;
            hasChanged = true;
            validateField("Description", value, lang);
          }
        }

        if (hasChanged) {
          if (authUser && authUser.roles["STUDENT"]) {
            updatedUntutorial.Status = "DRAFT";
          }
          setDirty(true);
        }

        return hasChanged ? updatedUntutorial : currentUntutorial;
      });
    },
    [authUser, lang, validateField]
  );

  const handleStatusOnChange = useCallback(
    (value) => {
      setUntutorial((currentUntutorial) => {
        if (value !== currentUntutorial.Status) {
          setDirty(true);
          validateField("Status", value);
          return { ...currentUntutorial, Status: value };
        }
        return currentUntutorial;
      });
    },
    [validateField]
  );

  const handleLevelOnChange = useCallback(
    (value) => {
      setUntutorial((currentUntutorial) => {
        if (value !== currentUntutorial.Level) {
          const updatedUntutorial = { ...currentUntutorial, Level: value };
          if (authUser && authUser.roles["STUDENT"]) {
            updatedUntutorial.Status = "DRAFT";
          }
          setDirty(true);
          validateField("Level", value);
          return updatedUntutorial;
        }
        return currentUntutorial;
      });
    },
    [authUser, validateField]
  );

  const handlePriorityOnChange = useCallback(
    (value) => {
      setUntutorial((currentUntutorial) => {
        if (value !== currentUntutorial.Priority) {
          const updatedUntutorial = { ...currentUntutorial, Priority: value };
          if (authUser && authUser.roles["STUDENT"]) {
            updatedUntutorial.Status = "DRAFT";
          }
          setDirty(true);
          validateField("Priority", value);
          return updatedUntutorial;
        }
        return currentUntutorial;
      });
    },
    [authUser, validateField]
  );

  // Step handlers - FIXED
  const handleStepTitleOnChange = useCallback(
    (value, step) => {
      setUntutorial((currentUntutorial) => {
        const currentValue = lang === "Español"
          ? currentUntutorial.steps[step].TitleEs
          : currentUntutorial.steps[step].Title;

        if (value !== currentValue) {
          const updatedUntutorial = { ...currentUntutorial };

          if (lang === "Español") {
            updatedUntutorial.steps[step].TitleEs = value;
          } else {
            updatedUntutorial.steps[step].Title = value;
          }

          if (authUser && authUser.roles["STUDENT"]) {
            updatedUntutorial.Status = "DRAFT";
          }

          setDirty(true);
          return updatedUntutorial;
        }
        return currentUntutorial;
      });
    },
    [authUser, lang]
  );

  const handleStepOnChange = useCallback(
    (value, step) => {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };
        let hasChanged = false;

        if (lang === "Español") {
          if (value !== updatedUntutorial.steps[step].DescriptionEs) {
            updatedUntutorial.steps[step].DescriptionEs = value;
            hasChanged = true;
          }
        }

        if (value !== updatedUntutorial.steps[step].Description) {
          updatedUntutorial.steps[step].Description = value;
          hasChanged = true;
        }

        if (hasChanged) {
          if (authUser && authUser.roles["STUDENT"]) {
            updatedUntutorial.Status = "DRAFT";
          }
          setDirty(true);
        }

        return hasChanged ? updatedUntutorial : currentUntutorial;
      });
    },
    [authUser, lang]
  );

  const addStepHandler = useCallback(() => {
    setUntutorial((currentUntutorial) => {
      const updatedUntutorial = { ...currentUntutorial };

      if (authUser && authUser.roles["STUDENT"]) {
        updatedUntutorial.Status = "DRAFT";
      }

      updatedUntutorial.steps[
        Math.max(...Object.keys(updatedUntutorial.steps)) + 1
      ] = {
        Description: "",
      };

      setDirty(true);
      setTimeout(saveChangesHandler, 0);
      return updatedUntutorial;
    });
  }, [authUser, saveChangesHandler]);

  const deleteStepHandler = useCallback(
    (event, stepKey) => {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };

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

        setDirty(true);
        setTimeout(saveChangesHandler, 0);
        return updatedUntutorial;
      });
    },
    [authUser, saveChangesHandler]
  );

  // Upload handlers
  const handleThumbnailUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const ext = file.name.substring(file.name.lastIndexOf(".") + 1);

      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };

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
            setUploadPercent(percentage);
            setUploading(true);
          },
          (error) => {
            setUploadPercent(0);
            setUploading(false);
          },
          () => {
            setUploadPercent(0);
            setUploading(false);
            setDirty(true);
            setTimeout(saveChangesHandler, 0);
          }
        );

        return updatedUntutorial;
      });
    },
    [authUser, firebase, saveChangesHandler]
  );

  const handleStepThumbnailUpload = useCallback(
    (event, step) => {
      const file = event.target.files[0];
      if (!file) return;

      const ext = file.name.substring(file.name.lastIndexOf(".") + 1);

      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };

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
            setUploadPercent(percentage);
            setUploading(true);
          },
          (error) => {
            console.log(error);
            setUploadPercent(0);
            setUploading(false);
          },
          () => {
            setUploadPercent(0);
            setUploading(false);
            setDirty(true);
            setTimeout(saveChangesHandler, 0);
          }
        );

        return updatedUntutorial;
      });
    },
    [authUser, firebase, lang, saveChangesHandler]
  );

  // Category and skills handlers
  const handleSkillsOnChange = useCallback((event) => {
    if (event.target.value !== "-1") {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };
        updatedUntutorial.Skills[event.target.value] = event.target.value;
        return updatedUntutorial;
      });
    }
  }, []);

  const handleSkillsOnClick = useCallback((text) => {
    setUntutorial((currentUntutorial) => {
      const updatedUntutorial = { ...currentUntutorial };
      delete updatedUntutorial.Skills[text];
      return updatedUntutorial;
    });
  }, []);

  const handleSkillsValidate = useCallback(() => {
    setUntutorial((currentUntutorial) => {
      try {
        if (Object.keys(currentUntutorial.Skills).length < 1) {
          throw "At least one skill required";
        } else {
          saveChangesHandler();
          setError("");
        }
      } catch (error) {
        setError(error);
      }
      return currentUntutorial;
    });
  }, [saveChangesHandler]);

  const handlePCategoryOnChange = useCallback((event) => {
    if (event.target.value !== "-1") {
      setUntutorial((currentUntutorial) => {
        const updatedUntutorial = { ...currentUntutorial };
        updatedUntutorial.Categories[event.target.value] = event.target.value;
        return updatedUntutorial;
      });
    }
  }, []);

  const handleCategoryOnClick = useCallback((text) => {
    setUntutorial((currentUntutorial) => {
      const updatedUntutorial = { ...currentUntutorial };
      delete updatedUntutorial.Categories[text];
      return updatedUntutorial;
    });
  }, []);

  const handleCategoryValidate = useCallback(() => {
    setUntutorial((currentUntutorial) => {
      try {
        if (Object.keys(currentUntutorial.Categories).length < 1) {
          throw "At least one category required";
        } else {
          saveChangesHandler();
          setError("");
        }
      } catch (error) {
        setError(error);
      }
      return currentUntutorial;
    });
  }, [saveChangesHandler]);

  // Progress handlers
  const handleProgressURLOnChange = useCallback((value) => {
    setProgress((currentProgress) => ({ ...currentProgress, URL: value }));
  }, []);

  const loadProgress = useCallback(() => {
    if (authUser && untutorial.key && untutorial.steps) {
      firebase
        .progress(authUser.uid, untutorial.key)
        .once("value")
        .then((snapshot) => {
          if (snapshot.exists()) {
            let progress = snapshot.val();
            if (!progress.steps) progress.steps = [];
            setProgress(progress);
          } else {
            let progress = {
              Status: "DRAFT",
              steps: [],
              LastModified: Date.now(),
              profile: authUser.uid,
              untut: key,
              url: "",
            };
            if (Array.isArray(untutorial.steps)) {
              untutorial.steps.forEach((step, i) => {
                progress.steps.push({ Status: "DRAFT", Comments: "" });
              });
            }
            snapshot.ref.set({ ...progress }).then(() => {
              setProgress(progress);
            }).catch((error) => {
              console.error("Error setting progress:", error);
              setError(error.message);
            });
          }
        })
        .catch((error) => {
          console.error("Error loading progress:", error);
          setError(error.message);
        });
    }

    if (showiframe) setShowiframe(false);
  }, [authUser, firebase, key, untutorial.key, untutorial.steps, showiframe]);

  const studentApprove = useCallback(
    (step) => {
      setProgress((currentProgress) => {
        const updatedProgress = { ...currentProgress };

        if (!currentProgress.steps[step]) {
          currentProgress.steps[step] = { Status: "PENDING", Comments: "" };
        }
        currentProgress.steps[step].Status = "PENDING";

        setTimeout(saveProgressHandler, 0);
        return updatedProgress;
      });
    },
    [saveProgressHandler]
  );

  const deleteProjectHandler = useCallback(() => {
    firebase
      .untutorial(key)
      .remove()
      .then(() => {
        window.location = ROUTES.LANDING;
      })
      .catch((error) => {
        console.error("Error deleting untutorial:", error);
        setError(error.message);
      });
  }, [firebase, key]);

  const chooseLang = useCallback(
    (event) => {
      setLang(event.target.value);
      if (authUser) {
        firebase
          .profile(authUser.uid + "/lang")
          .set(event.target.value)
          .catch((error) => {
            console.error("Error saving language preference:", error);
          });
      }
    },
    [authUser, firebase]
  );

  // Effects
  useEffect(() => {
    document.body.addEventListener("click", handleClick);
    return () => document.body.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    const unsubscribe = firebase.untutorial(key).on("value", (snapshot) => {
      const untutorialData = snapshot.val();
      if (untutorialData) {
        firebase
          .profile(untutorialData.Author)
          .once("value")
          .then((snapshot2) => {
            const author = snapshot2.val();
            untutorialData.Author = author;
            setUntutorial(untutorialData);
            setLoading(false);

            if (location.search.includes("loadProgress")) {
              loadProgress();
            }
          })
          .catch((error) => {
            console.error("Error loading author profile:", error);
            setError(error.message);
            setLoading(false);
          });
      }
    });

    return () => {
      firebase.untutorial(key).off("value", unsubscribe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebase, key, location.search]);

  useEffect(() => {
    if (authUser && !init && lang !== authUser.lang) {
      setInit(true);
      setLang(authUser.lang);
    }
  }, [authUser, init, lang]);

  // Memoize computed values
  const stepCount = useMemo(() => {
    return untutorial && untutorial.steps ? untutorial.steps.length : 0;
  }, [untutorial]);

  const nextStep = useMemo(() => {
    if (!progress) return -1;
    let next = progress.nextStep;
    if (next > stepCount) next = 0;
    return next;
  }, [progress, stepCount]);

  const isAuthorized = useMemo(() => {
    return authUser && (authUser.roles["ADMIN"] || authUser.uid === untutorial.Author?.key);
  }, [authUser, untutorial.Author]);

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
                onClick={() => {
                  setShowiframe(false);
                  setProgress(null);
                }}
              >
                <i className="fa fa-close"></i>
              </a>
            </>
          )}
          <div
            onClick={() => setShowiframe((prev) => !prev)}
            className="toggle-iframe"
          >
            <i className="fa fa-code"></i>
          </div>
        </div>
      </div>

      <div className={`thumbnail hero ${showiframe ? "blur" : ""}`}>
        {isAuthorized && (
          <label htmlFor="files" className="upload">
            <input id="files" type="file" onChange={handleThumbnailUpload} />
          </label>
        )}
        {uploading && <progress value={uploadPercent} max="100" />}
        {untutorial.ThumbnailFilename &&
          untutorial.ThumbnailFilename.length !== 0 &&
          !uploading && (
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
                        disabled={!isAuthorized}
                        type={"plain"}
                        className="header"
                        onEditorChange={(value) =>
                          handleStepTitleOnChange(value, index)
                        }
                        onEditorSave={saveChangesHandler}
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
                      disabled={!isAuthorized}
                      type={"text"}
                      className={progress ? "no-button" : "editor"}
                      onEditorChange={(value) =>
                        handleStepOnChange(value, index)
                      }
                      onEditorSave={saveChangesHandler}
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
                      {isAuthorized && (
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

                      {uploading && (
                        <progress value={uploadPercent} max="100" />
                      )}

                      {untutorial.steps[index].ThumbnailFilename &&
                        untutorial.steps[index].ThumbnailFilename.length !==
                          0 &&
                        !uploading &&
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

                      {isAuthorized && lang === "Español" && (
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
                        !uploading &&
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

                  {stepCount > 1 && isAuthorized && (
                    <button
                      className="del"
                      onClick={(event) => deleteStepHandler(event, index)}
                    >
                      Delete Step
                    </button>
                  )}
                </div>
              ))}

            {isAuthorized && (
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
                disabled={!isAuthorized}
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
              disabled={!isAuthorized}
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
              disabled={!isAuthorized}
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

          {isAuthorized && (
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

          {isAuthorized && (
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
