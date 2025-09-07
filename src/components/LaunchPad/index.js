import React, { useState, useEffect, useCallback } from "react";
import LazyImage from "../LazyImage";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import * as FILTER from "../../constants/filter";
import * as FILTER2 from "../../constants/filter2";
import * as LEVELS from "../../constants/levels";
import { Helmet } from "react-helmet";
import "./launchpad.scss";

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const LaunchPad = ({ authUser, firebase }) => {
  const [loading, setLoading] = useState(true);
  const [untutorials, setUntutorials] = useState([]);
  const [lang, setLang] = useState(authUser ? authUser.lang : "English");

  // Helper function to get query parameters
  const getQueryParam = useCallback((param, defaultValue) => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    if (param === "l" && value) {
      return value.split("%2C");
    }
    return value || defaultValue;
  }, []);

  // Initialize state from URL parameters
  const [cfilter, setCfilter] = useState(() => getQueryParam("c", "SCRATCH"));
  const [lfilter, setLfilter] = useState(() => getQueryParam("l", ["LEVEL1"]));
  const [textFilter, setTextFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updateKey, setUpdateKey] = useState(0);

  // Function to update URL parameters and trigger navigation
  const updateURL = useCallback((newCfilter, newLfilter) => {
    const params = new URLSearchParams();
    if (newCfilter) params.set("c", newCfilter);
    if (newLfilter && newLfilter.length > 0) {
      params.set("l", newLfilter.join("%2C"));
    }

    const newURL =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");

    // Use replaceState for the current navigation to avoid cluttering history
    window.history.replaceState(
      { cfilter: newCfilter, lfilter: newLfilter },
      "",
      newURL
    );
  }, []);

  // Listen for browser navigation events (back/forward buttons)
  useEffect(() => {
    const handlePopState = (event) => {
      // Re-read parameters from URL when user navigates back/forward
      const newCfilter = getQueryParam("c", "SCRATCH");
      const newLfilter = getQueryParam("l", ["LEVEL1"]);

      setCfilter(newCfilter);
      setLfilter(newLfilter);

      // Reset selectedCategory when navigating
      if (newCfilter === "PYTHON") {
        setSelectedCategory("UNTUTORIALS");
      } else {
        setSelectedCategory(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [getQueryParam]);

  // Firebase data fetching
  useEffect(() => {
    const unsub = firebase.untutorials().on("value", (snapshot) => {
      if (snapshot && snapshot.val()) {
        const untutsObj = snapshot.val();
        const untutsList = Object.keys(untutsObj).map((key) => ({
          ...untutsObj[key],
          pid: key,
        }));
        setUntutorials(untutsList);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [firebase]);

  // Initialize selectedCategory based on cfilter
  useEffect(() => {
    if (cfilter === "PYTHON" && !selectedCategory) {
      setSelectedCategory("UNTUTORIALS");
    } else if (cfilter !== "PYTHON") {
      setSelectedCategory(null);
    }
  }, [cfilter, selectedCategory]);

  const chooseLang = (event) => {
    const newLang = event.target.value;
    setLang(newLang);
    if (authUser) {
      firebase.profile(authUser.uid + "/lang").set(newLang);
    }
  };

  const textFilterOnChange = (event) => {
    setTextFilter(event.target.value);
  };

  const toggleCFilter = (e) => {
    const value = e.target.value;

    if (cfilter !== value) {
      setCfilter(value);

      let newSelectedCategory = null;
      if (value === "PYTHON") {
        newSelectedCategory = "UNTUTORIALS";
        setSelectedCategory(newSelectedCategory);
      } else {
        setSelectedCategory(null);
      }

      // Update URL immediately
      updateURL(value, lfilter);
    }
  };

  const toggleLFilter = (e) => {
    const value = e.target.value;

    const filterSet = new Set(lfilter);

    if (filterSet.has(value)) {
      filterSet.delete(value);
    } else {
      filterSet.add(value);
    }

    const newLFilter = Array.from(filterSet);
    setLfilter(newLFilter);

    // Update URL immediately
    updateURL(cfilter, newLFilter);
  };

  const toggleCategory = (category) => {
    setSelectedCategory(category);
    // Note: Category selection doesn't update URL as it's a sub-filter
  };

  const filteredUntutorials = untutorials.filter((untutorial) => {
    const isApproved = untutorial.Status === "APPROVED";
    const matchesLevelFilter =
      lfilter.length === 0 || lfilter.includes("LEVEL" + untutorial.Level);
    const matchesTextFilter = untutorial.Title.toLowerCase().includes(
      textFilter.toLowerCase()
    );
    const hasCategories =
      untutorial.Categories && typeof untutorial.Categories === "object";

    if (!hasCategories) {
      return false;
    }

    const categories = Object.values(untutorial.Categories);

    const isPythonSelected = cfilter === "PYTHON";
    if (isPythonSelected) {
      return (
        isApproved &&
        matchesLevelFilter &&
        matchesTextFilter &&
        categories.includes("PYTHON") &&
        (selectedCategory === null || categories.includes(selectedCategory))
      );
    }

    return (
      isApproved &&
      matchesLevelFilter &&
      matchesTextFilter &&
      (!cfilter || categories.includes(cfilter))
    );
  });

  const untutorialLevels = groupBy(filteredUntutorials, "Level");

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div key={updateKey}>
      <section id="launchpad">
        <Helmet>
          <title>Launch Pad</title>
        </Helmet>
        <div className="toggleLang">
          {/* Language selector code - commented out as in original */}
        </div>
        <div className="main">
          <div className="sidebar">
            <div className="filter">
              {loading && <div className="loading">Loading ...</div>}
              <div>
                <h2>Category</h2>
                {Object.keys(FILTER).map((f) => (
                  <button
                    key={f}
                    onClick={toggleCFilter}
                    value={f}
                    className={cfilter && cfilter.includes(f) ? "f" : ""}
                  >
                    {FILTER[f]}
                  </button>
                ))}
              </div>
              <div>
                <h2>Level</h2>
                {Object.keys(LEVELS).map((f) => (
                  <button
                    key={f}
                    onClick={toggleLFilter}
                    value={f}
                    className={lfilter.includes(f) ? "f" : ""}
                  >
                    {LEVELS[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="main-content">
            <input
              className="search"
              type="text"
              onChange={textFilterOnChange}
              placeholder="Search..."
            />
            {cfilter !== null && cfilter.includes("PYTHON") && (
              <div className="buttons">
                <button
                  onClick={() => toggleCategory("UNTUTORIALS")}
                  className={
                    selectedCategory === "UNTUTORIALS" ? "selected-button" : ""
                  }
                >
                  Untutorials
                </button>
                <button
                  onClick={() => toggleCategory("CHALLENGES")}
                  className={
                    selectedCategory === "CHALLENGES" ? "selected-button" : ""
                  }
                >
                  Challenges
                </button>
              </div>
            )}
            <div className="items">
              {Object.keys(filteredUntutorials).length > 0 ? (
                Object.keys(untutorialLevels).map((level) => (
                  <React.Fragment key={level}>
                    <h1>{"Level " + level}</h1>
                    {untutorialLevels[level]
                      .sort((a, b) => a.Priority - b.Priority)
                      .map((untutorial) => (
                        <a
                          key={untutorial.key}
                          className="card"
                          id={untutorial.key}
                          href={ROUTES.LAUNCHPAD + "/" + untutorial.key}
                          path={
                            "/public/" +
                            untutorial.Author +
                            "/" +
                            untutorial.ThumbnailFilename
                          }
                        >
                          <LazyImage
                            key={untutorial.key}
                            file={firebase.storage.ref(
                              "/public/" +
                                untutorial.Author +
                                "/" +
                                untutorial.ThumbnailFilename
                            )}
                          />
                          <div>
                            <h2
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
                                    ? untutorial.DescriptionEs.replace(
                                        /<(.|\n)*?>/g,
                                        ""
                                      ).trim()
                                    : untutorial.Description.replace(
                                        /<(.|\n)*?>/g,
                                        ""
                                      ).trim(),
                              }}
                            />
                            <button>Go to Untutorial</button>
                          </div>
                        </a>
                      ))}
                  </React.Fragment>
                ))
              ) : (
                <div className="no-items-message">
                  No items found in this category
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default withFirebase(LaunchPad);
