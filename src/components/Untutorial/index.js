import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  // Consolidated state management
  const [loading, setLoading] = useState(true);
  const [untutorial, setUntutorial] = useState({});
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [showiframe, setShowiframe] = useState(true);
  const [lang, setLang] = useState(authUser?.lang || "English");
  const [languageSelect, setLanguageSelect] = useState(true);

  // Use ref instead of state for isEditing to avoid triggering re-renders
  const isEditingRef = React.useRef(false);
  const dirtyRef = React.useRef(false);
  const untutorialRef = React.useRef(untutorial);

  // Memoized values
  const progressSteps = useMemo(() => progress?.steps || null, [progress]);
  const stepCount = useMemo(
    () => untutorial?.steps?.length || 0,
    [untutorial?.steps],
  );
  const nextStep = useMemo(() => {
    const step = progress?.nextStep || -1;
    return step > stepCount ? 0 : step;
  }, [progress?.nextStep, stepCount]);

  // Event handlers
  const handleClick = useCallback((e) => {
    if (e.target.className === "iframe-on") {
      setShowiframe(false);
    }
  }, []);

  const toggleVisibility = useCallback(() => {
    setLanguageSelect((prev) => !prev);
  }, []);

  // Validation functions
  const validateTitle = useCallback(() => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      const text = untutorial.Title
        ? untutorial.Title.replace(/<(.|\n)*?>/g, "").trim()
        : "";
      const textEs = untutorial.TitleEs
        ? untutorial.TitleEs.replace(/<(.|\n)*?>/g, "").trim()
        : "";

      if (lang === "English") {
        if (text.length === 0) {
          newErrors["Title"] = 'TITLE.<span class="red">ISREQUIRED</span>';
        } else {
          delete newErrors["Title"];
        }
      }
      if (lang === "Español") {
        if (textEs.length === 0) {
          newErrors["TitleEs"] = 'TITLE.<span class="red">ISREQUIRED</span>';
        } else {
          delete newErrors["TitleEs"];
        }
      }
      return newErrors;
    });
  }, [untutorial.Title, untutorial.TitleEs, lang]);

  const validateDescription = useCallback(() => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (lang === "English") {
        if (untutorial.Description === "") {
          newErrors["Description"] = "Description is required.";
        } else {
          delete newErrors["Description"];
        }
      }
      if (lang === "Español") {
        if (untutorial.DescriptionEs === "") {
          newErrors["DescriptionEs"] = "Description is required.";
        } else {
          delete newErrors["DescriptionEs"];
        }
      }
      return newErrors;
    });
  }, [untutorial.Description, untutorial.DescriptionEs, lang]);

  const validateStatus = useCallback(() => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (!["DRAFT", "APPROVED"].includes(untutorial.Status)) {
        newErrors["Status"] = 'STATUS.<span class="red">ISINVALID</span>';
      } else {
        delete newErrors["Status"];
      }
      return newErrors;
    });
  }, [untutorial.Status]);

  const validateLevel = useCallback(() => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (isNaN(untutorial.Level)) {
        newErrors["Level"] = 'LEVEL.<span class="red">ISINVALID</span>';
      } else if (![1, 2, 3, 4, 5, 6, 7].includes(parseInt(untutorial.Level))) {
        newErrors["Level"] = 'LEVEL.<span class="red">ISOUTSIDERANGE</span>';
      } else {
        delete newErrors["Level"];
      }
      return newErrors;
    });
  }, [untutorial.Level]);

  const validatePriority = useCallback(() => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (isNaN(untutorial.Priority)) {
        newErrors["Priority"] = 'PRIORITY.<span class="red">ISINVALID</span>';
      } else if (
        ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(
          parseInt(untutorial.Priority),
        )
      ) {
        newErrors["Priority"] =
          'PRIORITY.<span class="red">ISOUTSIDERANGE</span>';
      } else {
        delete newErrors["Priority"];
      }
      return newErrors;
    });
  }, [untutorial.Priority]);

  const validateStep = useCallback(
    (index) => {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        const step = untutorial.steps?.[index];
        if (!step) return newErrors;

        const text = step.Description.replace(/<(.|\n)*?>/g, "").trim();

        if (text === "") {
          newErrors["STEP" + index] =
            `STEP.<span class="orange">${index}</span>.<span class="red">ISREQUIRED</span>`;
        } else if (text.length < 20) {
          newErrors["STEP" + index] =
            `STEP.<span class="orange">${index}</span>.<span class="red">ISTOOSHORT</span>`;
        } else {
          delete newErrors["STEP" + index];
        }
        return newErrors;
      });
    },
    [untutorial.steps],
  );

  // Save functions
  const saveChangesHandler = useCallback(
    (untutorialToSave) => {
      const currentUntutorial = untutorialToSave || untutorial;
      if (
        Object.values(errors).length === 0 &&
        currentUntutorial.key &&
        currentUntutorial.Author?.key
      ) {
        const updatedUntutorial = {
          ...currentUntutorial,
          LastModified: Date.now(),
          Author: currentUntutorial.Author.key,
        };

        return firebase
          .untutorial(key)
          .set(updatedUntutorial)
          .then(() => {
            setDirty(false);
            return { saved: true };
          })
          .catch((error) => {
            setError(error.message);
            return { saved: false };
          });
      }
      return Promise.resolve({ saved: false });
    },
    [errors, untutorial, firebase, key],
  );

  const saveProgressHandler = useCallback(
    (progressToSave) => {
      const currentProgress = progressToSave || progress;
      if (currentProgress) {
        const updatedProgress = {
          ...currentProgress,
          LastModified: Date.now(),
        };

        firebase
          .progress(authUser.uid, untutorial.key)
          .set(updatedProgress)
          .then(() => {
            // Progress saved successfully
          })
          .catch((error) => console.error(error));
      }
    },
    [progress, firebase, authUser, untutorial.key],
  );

  // Content change handlers with proper state updates
  const handleTitleOnChange = useCallback(
    (value) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        const updated = { ...prev };
        if (lang === "Español") {
          if (value !== updated.TitleEs) {
            updated.TitleEs = value;
          }
        } else {
          if (value !== updated.Title) {
            updated.Title = value;
          }
          if (authUser?.roles?.["STUDENT"]) {
            updated.Status = "DRAFT";
          }
        }
        return updated;
      });
      setDirty(true);
      setTimeout(validateTitle, 0);
    },
    [lang, authUser, validateTitle],
  );

  const handleDescriptionOnChange = useCallback(
    (value) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        const updated = { ...prev };
        if (lang === "Español") {
          if (value !== updated.DescriptionEs) {
            updated.DescriptionEs = value;
          }
        } else {
          if (value !== updated.Description) {
            updated.Description = value;
          }
        }
        if (authUser?.roles?.["STUDENT"]) {
          updated.Status = "DRAFT";
        }
        return updated;
      });
      setDirty(true);
      setTimeout(validateDescription, 0);
    },
    [lang, authUser, validateDescription],
  );

  const handleStatusOnChange = useCallback(
    (value) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        if (value !== prev.Status) {
          const updated = { ...prev, Status: value };
          return updated;
        }
        return prev;
      });
      setDirty(true);
      setTimeout(validateStatus, 0);
    },
    [validateStatus],
  );

  const handleLevelOnChange = useCallback(
    (value) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        if (value !== prev.Level) {
          const updated = { ...prev, Level: value };
          if (authUser?.roles?.["STUDENT"]) {
            updated.Status = "DRAFT";
          }
          return updated;
        }
        return prev;
      });
      setDirty(true);
      setTimeout(validateLevel, 0);
    },
    [authUser, validateLevel],
  );

  const handlePriorityOnChange = useCallback(
    (value) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        if (value !== prev.Priority) {
          const updated = { ...prev, Priority: value };
          if (authUser?.roles?.["STUDENT"]) {
            updated.Status = "DRAFT";
          }
          return updated;
        }
        return prev;
      });
      setDirty(true);
      setTimeout(validatePriority, 0);
    },
    [authUser, validatePriority],
  );

  // Step handlers with proper immutable updates
  const handleStepTitleOnChange = useCallback(
    (value, stepIndex) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        const updated = { ...prev };
        const steps = [...(updated.steps || [])];

        if (!steps[stepIndex]) return prev;

        const currentStep = { ...steps[stepIndex] };

        if (lang === "Español") {
          if (value !== currentStep.TitleEs) {
            currentStep.TitleEs = value;
          }
        } else {
          if (value !== currentStep.Title) {
            currentStep.Title = value;
          }
        }

        if (authUser?.roles?.["STUDENT"]) {
          updated.Status = "DRAFT";
        }

        steps[stepIndex] = currentStep;
        updated.steps = steps;
        setDirty(true);

        return updated;
      });
    },
    [lang, authUser],
  );

  const handleStepOnChange = useCallback(
    (value, stepIndex) => {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        const updated = { ...prev };
        const steps = [...(updated.steps || [])];

        if (!steps[stepIndex]) return prev;

        const currentStep = { ...steps[stepIndex] };

        // Update the appropriate language field
        if (lang === "Español") {
          currentStep.DescriptionEs = value;
        } else {
          currentStep.Description = value;
        }

        if (authUser?.roles?.["STUDENT"]) {
          updated.Status = "DRAFT";
        }

        steps[stepIndex] = currentStep;
        updated.steps = steps;

        return updated;
      });
      setDirty(true);
      setTimeout(() => {
        validateStep(stepIndex);
      }, 100);
    },
    [lang, authUser, validateStep],
  );

  const addStepHandler = useCallback(() => {
    isEditingRef.current = true;

    setUntutorial((prev) => {
      const updated = { ...prev };
      const steps = [...(updated.steps || [])];

      if (authUser?.roles?.["STUDENT"]) updated.Status = "DRAFT";

      steps.push({
        id: uuidv4(), // Stable unique ID for React key
        Title: "",
        Description: "",
        TitleEs: "",
        DescriptionEs: "",
      });

      updated.steps = steps;
      return updated;
    });

    setDirty(true);
  }, [authUser]);

  const deleteStepHandler = useCallback(
    (event, stepIndex) => {
      isEditingRef.current = true;

      setUntutorial((prev) => {
        const updated = { ...prev };
        const steps = [...(updated.steps || [])];

        if (authUser?.roles?.["STUDENT"]) {
          updated.Status = "DRAFT";
        }

        // Remove the step and reindex
        steps.splice(stepIndex, 1);
        updated.steps = steps;

        return updated;
      });

      setDirty(true);
    },
    [authUser],
  );

  // Upload handlers
  const handleThumbnailUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const ext = file.name.substring(file.name.lastIndexOf(".") + 1);
      const filename = uuidv4() + "." + ext;

      isEditingRef.current = true;

      // Get the author key from current state
      const authorKey = untutorial.Author?.key;
      if (!authorKey) {
        console.error("Author key not available");
        return;
      }

      // Upload to Firebase first
      const storageRef = firebase.storage.ref(
        `/public/${authorKey}/${filename}`,
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
          console.error(error);
          setUploadPercent(0);
          setUploading(false);
          isEditingRef.current = false;
        },
        () => {
          // Upload complete - now update the state with the filename
          setUntutorial((prev) => {
            const updated = { ...prev };
            if (authUser?.roles?.["STUDENT"]) {
              updated.Status = "DRAFT";
            }
            updated.ThumbnailFilename = filename;

            // Save the updated untutorial immediately with the new value
            setTimeout(() => saveChangesHandler(updated), 0);

            return updated;
          });
          setUploadPercent(0);
          setUploading(false);
          setDirty(true);
        },
      );
    },
    [authUser, firebase, saveChangesHandler, untutorial.Author?.key],
  );

  const handleStepThumbnailUpload = useCallback(
    (event, stepIndex) => {
      const file = event.target.files[0];
      if (!file) return;

      const ext = file.name.substring(file.name.lastIndexOf(".") + 1);
      const filename = uuidv4() + "." + ext;

      isEditingRef.current = true;

      // Get the author key from current state
      const authorKey = untutorial.Author?.key;
      if (!authorKey) {
        console.error("Author key not available");
        return;
      }

      // Upload to Firebase first
      const storageRef = firebase.storage.ref(
        `/public/${authorKey}/${filename}`,
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
          console.error(error);
          setUploadPercent(0);
          setUploading(false);
          isEditingRef.current = false;
        },
        () => {
          // Upload complete - now update the state with the filename
          setUntutorial((prev) => {
            const updated = { ...prev };
            const steps = [...(updated.steps || [])];

            if (!steps[stepIndex]) return prev;

            const currentStep = { ...steps[stepIndex] };

            if (authUser?.roles?.["STUDENT"]) {
              updated.Status = "DRAFT";
            }

            if (lang === "Español") {
              currentStep.ThumbnailFilenameSp = filename;
            } else {
              currentStep.ThumbnailFilename = filename;
            }

            steps[stepIndex] = currentStep;
            updated.steps = steps;

            // Save the updated untutorial immediately with the new value
            setTimeout(() => saveChangesHandler(updated), 0);

            return updated;
          });
          setUploadPercent(0);
          setUploading(false);
          setDirty(true);
        },
      );
    },
    [lang, authUser, firebase, saveChangesHandler, untutorial.Author?.key],
  );

  // Category and skills handlers
  const handleSkillsOnChange = useCallback((event) => {
    if (event.target.value !== "-1") {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        const updated = { ...prev };
        updated.Skills = {
          ...(updated.Skills || {}),
          [event.target.value]: event.target.value,
        };
        return updated;
      });
      setDirty(true);
    }
  }, []);

  const handleSkillsOnClick = useCallback((skillKey) => {
    isEditingRef.current = true;
    setUntutorial((prev) => {
      const updated = { ...prev };
      const skills = { ...(updated.Skills || {}) };
      delete skills[skillKey];
      updated.Skills = skills;
      return updated;
    });
    setDirty(true);
  }, []);

  const handleSkillsValidate = useCallback(() => {
    try {
      if (Object.keys(untutorial.Skills || {}).length < 1) {
        throw new Error("At least one skill required");
      } else {
        saveChangesHandler();
        setError("");
      }
    } catch (error) {
      setError(error.message);
    }
  }, [untutorial.Skills, saveChangesHandler]);

  const handlePCategoryOnChange = useCallback((event) => {
    if (event.target.value !== "-1") {
      isEditingRef.current = true;
      setUntutorial((prev) => {
        const updated = { ...prev };
        updated.Categories = {
          ...(updated.Categories || {}),
          [event.target.value]: event.target.value,
        };
        return updated;
      });
      setDirty(true);
    }
  }, []);

  const handleCategoryOnClick = useCallback((categoryKey) => {
    isEditingRef.current = true;
    setUntutorial((prev) => {
      const updated = { ...prev };
      const categories = { ...(updated.Categories || {}) };
      delete categories[categoryKey];
      updated.Categories = categories;
      return updated;
    });
    setDirty(true);
  }, []);

  const handleCategoryValidate = useCallback(() => {
    try {
      if (Object.keys(untutorial.Categories || {}).length < 1) {
        throw new Error("At least one category required");
      } else {
        saveChangesHandler();
        setError("");
      }
    } catch (error) {
      setError(error.message);
    }
  }, [untutorial.Categories, saveChangesHandler]);

  // Progress handlers
  const handleProgressURLOnChange = useCallback(
    (value) => {
      setProgress((prev) => {
        const updated = { ...prev, URL: value };
        // Save the updated progress immediately with the new value
        setTimeout(() => saveProgressHandler(updated), 0);
        return updated;
      });
    },
    [saveProgressHandler],
  );

  const handleProgressURLSave = useCallback(() => {
    // Wrapper function to prevent TCSEditor from passing text argument to saveProgressHandler
    // The actual save happens in handleProgressURLOnChange
  }, []);

  const loadProgress = useCallback(() => {
    if (authUser && untutorial.key) {
      firebase
        .progress(authUser.uid, untutorial.key)
        .on("value", (snapshot) => {
          if (snapshot.exists()) {
            let progressData = snapshot.val();
            if (!progressData.steps) progressData.steps = [];
            setProgress(progressData);
          } else {
            let progressData = {
              Status: "DRAFT",
              steps: [],
              LastModified: Date.now(),
              profile: authUser.uid,
              untut: key,
              url: "",
            };
            untutorial.steps?.forEach((step, i) => {
              progressData.steps.push({ Status: "DRAFT", Comments: "" });
            });
            snapshot.ref.set({ ...progressData }).then(() => {
              setProgress(progressData);
            });
          }
        });
    }

    setShowiframe(false);
  }, [authUser, firebase, untutorial.key, untutorial.steps, key]);

  const studentApprove = useCallback(
    (stepIndex) => {
      setProgress((prev) => {
        const updated = { ...prev };
        const steps = [...(updated.steps || [])];

        if (!steps[stepIndex]) {
          steps[stepIndex] = { Status: "PENDING", Comments: "" };
        } else {
          steps[stepIndex] = { ...steps[stepIndex], Status: "PENDING" };
        }

        updated.steps = steps;

        // Save the updated progress immediately with the new value
        setTimeout(() => saveProgressHandler(updated), 0);

        return updated;
      });
    },
    [saveProgressHandler],
  );

  const deleteProjectHandler = useCallback(() => {
    firebase.untutorial(key).remove();
    history.push(ROUTES.LANDING);
  }, [firebase, key, history]);

  const chooseLang = useCallback(
    (event) => {
      const newLang = event.target.value;
      setLang(newLang);
      if (authUser) {
        firebase.profile(authUser.uid + "/lang").set(newLang);
      }
    },
    [authUser, firebase],
  );

  // Effects
  useEffect(() => {
    document.body.addEventListener("click", handleClick);
    return () => document.body.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    const unsubscribe = firebase.untutorial(key).on("value", (snapshot) => {
      const untutorialData = snapshot.val();
      // Only update if we're not currently editing
      if (untutorialData && !isEditingRef.current) {
        firebase
          .profile(untutorialData.Author)
          .once("value")
          .then((snapshot2) => {
            // Check again before updating - user might have started editing during async fetch
            if (!isEditingRef.current) {
              const author = snapshot2.val();
              untutorialData.Author = author;
              setUntutorial(untutorialData);
              setLoading(false);

              if (location.search.includes("loadProgress")) {
                loadProgress();
              }
            }
          });
      }
    });

    return () => {
      firebase.untutorial(key).off("value", unsubscribe);
    };
  }, [firebase, key, location.search, loadProgress]);

  useEffect(() => {
    if (authUser && lang !== authUser.lang) {
      setLang(authUser.lang);
    }
  }, [authUser]);

  // Sync state to refs
  useEffect(() => {
    dirtyRef.current = dirty;
    untutorialRef.current = untutorial;
  }, [dirty, untutorial]);

  // One-time migration: ensure all steps have IDs
  useEffect(() => {
    if (untutorial.steps && untutorial.steps.length > 0) {
      const needsMigration = untutorial.steps.some((step) => !step.id);

      if (needsMigration) {
        isEditingRef.current = true;

        setUntutorial((prev) => {
          const updated = { ...prev };
          updated.steps = prev.steps.map((step) => ({
            ...step,
            id: step.id || uuidv4(),
          }));
          return updated;
        });

        setDirty(true); // This will save the IDs to Firebase
      }
    }
  }, [untutorial.key]); // Only run when untutorial loads (key changes)

  // Auto-save effect (reduced to 500ms for faster saves)
  useEffect(() => {
    if (dirty) {
      const timeoutId = setTimeout(() => {
        saveChangesHandler().then(() => {
          // Reset editing flag after auto-save attempt
          // The Firebase listener has its own race condition protection
          isEditingRef.current = false;
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [dirty, saveChangesHandler]);

  // Save on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirtyRef.current && untutorialRef.current) {
        // Save immediately before unload using the latest state from ref
        const updatedUntutorial = {
          ...untutorialRef.current,
          LastModified: Date.now(),
          Author:
            untutorialRef.current.Author?.key || untutorialRef.current.Author,
        };

        // Use navigator.sendBeacon for more reliable async save before unload
        const data = JSON.stringify(updatedUntutorial);
        try {
          // Attempt synchronous save as fallback
          firebase.untutorial(key).set(updatedUntutorial);
        } catch (error) {
          console.error("Error saving on unload:", error);
        }
      }
    };

    const handleVisibilityChange = () => {
      // Save when page becomes hidden (user switching tabs, minimizing, etc.)
      if (document.hidden && dirtyRef.current) {
        saveChangesHandler(untutorialRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Save on component unmount if there are unsaved changes
      if (dirtyRef.current && untutorialRef.current) {
        saveChangesHandler(untutorialRef.current);
      }
    };
  }, [saveChangesHandler, firebase, key]);

  // Render
  if (loading) return <div className="loading">Loading ...</div>;

  const { Title, Description, Level, steps } = untutorial;

  return (
    <section id="untutorial">
      <Helmet>
        <title>{`${
          authUser
            ? `${authUser.Username.replace(/\./g, " ").replace(/\w\S*/g, (w) =>
                w.replace(/^\w/, (c) => c.toUpperCase()),
              )} - ${untutorial.Title?.replace(/<(.|\n)*?>/g, "").trim() || ""}`
            : untutorial.Title?.replace(/<(.|\n)*?>/g, "").trim() || ""
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
            onClick={() => setShowiframe(!showiframe)}
            className="toggle-iframe"
          >
            <i className="fa fa-code"></i>
          </div>
        </div>
      </div>

      <div className={`thumbnail hero ${showiframe ? "blur" : ""}`}>
        {authUser &&
          (authUser.roles?.["ADMIN"] ||
            authUser.uid === untutorial.Author?.key) && (
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
                `/public/${untutorial.Author?.key}/${untutorial.ThumbnailFilename}`,
              )}
            />
          )}
      </div>

      <div className="workOnProject">
        {progress?.Status === "APPROVED" && (
          <h3>
            GREAT JOB! You finished this project!{" "}
            <Link to={`${ROUTES.UNIVERSE}/${progress.untut}`}>
              Publish to the UNIVERSE!
            </Link>
          </h3>
        )}
        {progress?.Status === "PENDING" && (
          <h3>Your teacher is reviewing your project!</h3>
        )}
        {progress?.Status === "DRAFT" && nextStep > 0 && (
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
                onEditorSave={handleProgressURLSave}
                placeholder={"http://"}
                url={true}
                buttonText={progress.URL ? "Edit Link" : "Add Link"}
                text={progress.URL}
              />
            )}
          </div>

          <div className="steps">
            {untutorial.steps?.map((step, index) => (
              <div
                key={step.id || `step-${index}`}
                className={
                  "step " +
                  (progress?.steps?.[index]?.Status === "PENDING" ? "" : "")
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
                          (authUser.roles?.["ADMIN"] ||
                            authUser.uid === untutorial.Author?.key)
                        )
                      }
                      type={"code"}
                      className="header"
                      onEditorChange={(value) =>
                        handleStepTitleOnChange(value, index)
                      }
                      onEditorSave={saveChangesHandler}
                      placeholder={"Step Title"}
                      buttonText={
                        authUser &&
                        (authUser.roles?.["ADMIN"] ||
                          authUser.uid === untutorial.Author?.key)
                          ? "Edit Title"
                          : ""
                      }
                      text={
                        lang === "Español" && step.TitleEs
                          ? step.TitleEs
                          : step.Title
                      }
                    />
                  </div>
                </div>

                <div className={"step-content"}>
                  <TCSEditor
                    disabled={
                      !(
                        authUser &&
                        (authUser.roles?.["ADMIN"] ||
                          authUser.uid === untutorial.Author?.key)
                      )
                    }
                    type={"text"}
                    className={
                      authUser &&
                      (authUser.roles?.["ADMIN"] ||
                        authUser.uid === untutorial.Author?.key)
                        ? "editor"
                        : progress
                          ? "no-button"
                          : "editor"
                    }
                    onEditorChange={(value) => handleStepOnChange(value, index)}
                    onEditorSave={saveChangesHandler}
                    placeholder={"Step Description"}
                    buttonText={
                      authUser &&
                      (authUser.roles?.["ADMIN"] ||
                        authUser.uid === untutorial.Author?.key)
                        ? "Edit Description"
                        : ""
                    }
                    text={
                      lang === "Español" && step.DescriptionEs
                        ? step.DescriptionEs
                        : step.Description
                    }
                  />

                  {progress?.steps?.[index]?.Comments && (
                    <div className={"comments"}>
                      <h4>Teacher comments:</h4>{" "}
                      {progress.steps[index].Comments}
                    </div>
                  )}

                  <div
                    className={
                      step.ThumbnailFilename ? "thumbnail crop" : "thumbnail"
                    }
                  >
                    {authUser &&
                      (authUser.roles?.["ADMIN"] ||
                        authUser.uid === untutorial.Author?.key) && (
                        <>
                          <p
                            className={
                              step.ThumbnailFilename ? "change" : "add"
                            }
                          >
                            {step.ThumbnailFilename
                              ? "Update Screenshot"
                              : "+ Add Screenshot"}
                          </p>
                          <label
                            htmlFor={`step${index}-thumbnail-upload`}
                            className={
                              step.ThumbnailFilename
                                ? "upload replace"
                                : "upload"
                            }
                          >
                            <input
                              id={`step${index}-thumbnail-upload`}
                              type="file"
                              onChange={(event) =>
                                handleStepThumbnailUpload(event, index)
                              }
                            />
                          </label>
                        </>
                      )}

                    {uploading && <progress value={uploadPercent} max="100" />}

                    {step.ThumbnailFilename &&
                      step.ThumbnailFilename.length !== 0 &&
                      !uploading &&
                      (lang === "English" || !step.ThumbnailFilenameSp) && (
                        <LazyImage
                          id={`step${index}-thumbnail`}
                          className="crop"
                          file={firebase.storage.ref(
                            `/public/${untutorial.Author?.key}/${step.ThumbnailFilename}`,
                          )}
                        />
                      )}

                    {authUser &&
                      (authUser.roles?.["ADMIN"] ||
                        authUser.uid === untutorial.Author?.key) &&
                      lang === "Español" && (
                        <>
                          <p
                            className={
                              step.ThumbnailFilenameSp ? "change" : "add"
                            }
                          >
                            {step.ThumbnailFilenameSp
                              ? "Update Screenshot"
                              : "+ Add Screenshot"}
                          </p>
                          <label
                            htmlFor={`step${index}-thumbnail-upload-es`}
                            className={
                              step.ThumbnailFilenameSp
                                ? "upload replace"
                                : "upload"
                            }
                          >
                            <input
                              id={`step${index}-thumbnail-upload-es`}
                              type="file"
                              onChange={(event) =>
                                handleStepThumbnailUpload(event, index)
                              }
                            />
                          </label>
                        </>
                      )}

                    {step.ThumbnailFilenameSp &&
                      step.ThumbnailFilenameSp.length !== 0 &&
                      !uploading &&
                      lang === "Español" && (
                        <LazyImage
                          id={`step${index}-thumbnail`}
                          className="crop"
                          file={firebase.storage.ref(
                            `/public/${untutorial.Author?.key}/${step.ThumbnailFilenameSp}`,
                          )}
                        />
                      )}
                  </div>

                  {progress &&
                    (!progress.steps?.[index] ||
                      progress.steps[index].Status === "DRAFT") && (
                      <button
                        disabled={false}
                        className={"done-button todo"}
                        onClick={() => studentApprove(index)}
                      >
                        Mark Done
                      </button>
                    )}
                  {progress?.steps?.[index]?.Status === "PENDING" && (
                    <div className="done-button pending">In Review</div>
                  )}
                  {progress?.steps?.[index]?.Status === "APPROVED" && (
                    <div className="done-button approved">Approved</div>
                  )}
                </div>

                {stepCount > 1 &&
                  authUser &&
                  (authUser.roles?.["ADMIN"] ||
                    authUser.uid === untutorial.Author?.key) && (
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
              (authUser.roles?.["ADMIN"] ||
                authUser.uid === untutorial.Author?.key) && (
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
            {untutorial.Categories?.["ML_FOR_KIDS"] &&
              !untutorial.Categories?.["MACHINE_LEARNING"] && (
                <a
                  className="scratch"
                  href="https://scratch.mit.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LazyImage
                    file={firebase.storage.ref("/public/scratch.png")}
                  />
                </a>
              )}
            {untutorial.Categories?.["ML_FOR_KIDS"] &&
              untutorial.Categories?.["MACHINE_LEARNING"] && (
                <a
                  className="mlfk"
                  href="/assets/mlfktg.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LazyImage file={firebase.storage.ref("/public/mlfk.png")} />
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
                    "/web/reference-guide.html",
                    "_blank",
                    "noopener,noreferrer",
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
                    (authUser.roles?.["ADMIN"] ||
                      authUser.uid === untutorial.Author?.key)
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
                  (authUser.roles?.["ADMIN"] ||
                    authUser.uid === untutorial.Author?.key)
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

          {authUser?.roles?.["ADMIN"] && (
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
                href={`/profile/${untutorial.Author?.key}`}
                dangerouslySetInnerHTML={{
                  __html: untutorial.Author?.DisplayName,
                }}
              />
            </h3>
          </div>

          <div className="container">
            <TCSEditor
              disabled={
                !(
                  authUser &&
                  (authUser.roles?.["ADMIN"] ||
                    authUser.uid === untutorial.Author?.key)
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
            (authUser.roles?.["ADMIN"] ||
              authUser.uid === untutorial.Author?.key) && (
              <div className="container">
                <h4>Status</h4>
                <TCSEditor
                  disabled={!(authUser && authUser.roles?.["ADMIN"])}
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
            (authUser.roles?.["ADMIN"] ||
              authUser.uid === untutorial.Author?.key) && (
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
                              f,
                            ),
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
