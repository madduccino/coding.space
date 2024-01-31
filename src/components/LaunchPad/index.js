import React, { useState, useEffect } from "react";
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
  const [cfilter, setCfilter] = useState(getQueryParam("c", "SCRATCH"));
  const [lfilter, setLfilter] = useState(getQueryParam("l", ["LEVEL1"]));
  const [textFilter, setTextFilter] = useState("");

  function getQueryParam(param, defaultValue) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) ? params.get(param).split("%2C") : defaultValue;
  }

  useEffect(() => {
    const unsub = firebase.untutorials().on("value", (snapshot) => {
      if (snapshot && snapshot.val()) {
        // Check if snapshot is valid
        const untutsObj = snapshot.val();
        const untutsList = Object.keys(untutsObj).map((key) => ({
          ...untutsObj[key],
          pid: key,
        }));
        setUntutorials(untutsList);
      }
      setLoading(false);
    });

    return () => unsub(); // Cleanup subscription on unmount
  }, [firebase]);

  const [updateKey, setUpdateKey] = useState(0);

  const chooseLang = (event) => {
    const newLang = event.target.value;
    setLang(newLang);
    if (authUser) {
      firebase.profile(authUser.uid + "/lang").set(newLang);
    }
  };

  useEffect(() => {
    // Function to parse query parameters
    function getQueryParam(param, defaultValue) {
      const params = new URLSearchParams(window.location.search);
      return params.get(param) ? params.get(param).split("%2C") : defaultValue;
    }

    // Initialize filter states based on URL parameters
    const initialCfilter = getQueryParam("c", "SCRATCH");
    const initialLfilter = getQueryParam("l", ["LEVEL1"]);

    // Set the state with the URL parameters
    setCfilter(initialCfilter);
    setLfilter(initialLfilter);
  }, []); // Empty dependency array to ensure this runs only on component mount

  const textFilterOnChange = (event) => {
    setTextFilter(event.target.value);
    // forceUpdate();
  };

  const toggleCFilter = (e) => {
    const value = e.target.value;

    // Set the category to the clicked category, but don't allow deselecting the same category
    if (cfilter !== value) {
      setCfilter(value);

      // If PYTHON is selected, set Untutorials as the default selected category
      if (value === "PYTHON") {
        setSelectedCategory("UNTUTORIALS");
      } else {
        setSelectedCategory(null); // Reset selectedCategory for other categories
      }

      // Update the query parameters
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("c", value); // Set the new category
      window.history.pushState(null, null, "?" + queryParams.toString());
    }
  };

  const toggleLFilter = (e) => {
    const value = e.target.value;

    // Create a new Set from the current lfilter array
    const filterSet = new Set(lfilter);

    // Add or remove the selected value
    if (filterSet.has(value)) {
      filterSet.delete(value);
    } else {
      filterSet.add(value);
    }

    // Convert the Set back to an array
    const newLFilter = Array.from(filterSet);
    setLfilter(newLFilter);

    // Update the query parameters
    updateQueryParam("l", newLFilter);
  };

  const updateQueryParam = (key, value) => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set(key, value);
    window.history.pushState(null, null, "?" + queryParams.toString());
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const toggleCategory = (category) => {
    // Set the selected category without allowing to toggle it off
    setSelectedCategory(category);
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
      return false; // Skip if no categories
    }

    const categories = Object.values(untutorial.Categories);

    // Check if "PYTHON" is selected and apply special filtering for "Untutorials" and "Challenges"
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

    // General filtering for the selected category
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
          {/* <a onClick={this.toggleVisibility}>
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
          </a> */}
          {/* <select value={lang} onChange={this.chooseLang}>
            <option value={lang}>{lang}</option>
            <option value={lang === "English" ? "Español" : "English"}>
              {lang === "English" ? "Español" : "English"}
            </option>
          </select> */}
          {/* <a onClick={() => this.setState({ lang: "en" })}>English</a>
              <a onClick={() => this.setState({ lang: "es" })}>Español</a> */}
        </div>
        <div className="main">
          <div className="sidebar">
            <div className="filter">
              {loading && <div className="loading">Loading ...</div>}
              <div>
                <h2>Category</h2>

                {Object.keys(FILTER).map((f) => (
                  <button
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
            {/* Conditionally render Untutorials and Challenges buttons */}
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
              {console.log(untutorialLevels)}

              {Object.keys(filteredUntutorials).length > 0 ? (
                Object.keys(untutorialLevels).map((level) => (
                  <>
                    <h1>{"Level " + level}</h1>

                    {untutorialLevels[level]
                      .sort((a, b) => a.Priority - b.Priority)
                      .map((untutorial) => (
                        <a
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
                  </>
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
