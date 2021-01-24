import React from "react";

import LazyImage from "../LazyImage";

import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import * as FILTER from "../../constants/filter";
import * as LEVELS from "../../constants/levels";

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
class LaunchPad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      untutorials: [],
      cfilter: (window.location.search.length > 0 ?  window.location.search.split('c=').pop().split('&').shift().split("%2C") : ["SCRATCH"]),
      lfilter: (window.location.search.length > 0 ?  window.location.search.split('l=').pop().split('&').shift().split("%2C") : ["LEVEL1"]),
      textFilter: "",
    };
    //console.log("hiya");
    this.categoryFilterOnChange = this.categoryFilterOnChange.bind(this);
    this.textFilterOnChange = this.textFilterOnChange.bind(this);
    this.filterOnClick = this.filterOnClick.bind(this);
    this.toggleCFilter = this.toggleCFilter.bind(this);
    this.toggleLFilter = this.toggleLFilter.bind(this);
  }

  categoryFilterOnChange(event) {
    const { filter } = this.state;
    if (event.target.value != "-1") {
      filter.push(event.target.value);
      this.setState({ filter: filter });
    }
  }
  textFilterOnChange(event) {
    this.setState({ textFilter: event.target.value });
    this.forceUpdate();
  }
  filterOnClick(text) {
    const { filter } = this.state;
    this.setState({ filter: filter.filter((f) => f !== text) });
  }
  toggleCFilter(e) {
    const { cfilter } = this.state;
    const queryParams = new URLSearchParams(window.location.search);
    if (cfilter.includes(e.target.value)) {
    const copyCfilter = cfilter.filter((f) => f !== e.target.value);
    this.setState({ cfilter: copyCfilter });
    queryParams.set("c", copyCfilter);
	}  
    else {
      cfilter.push(e.target.value);
    this.setState({ cfilter: cfilter });
    queryParams.set("c", cfilter);
	}
  window.history.pushState(null, null, "?"+queryParams.toString());

  }
  toggleLFilter(e) {
    const { lfilter } = this.state;
    const queryParams = new URLSearchParams(window.location.search);
    if (lfilter.includes(e.target.value)) {
      const copyLfilter = lfilter.filter((l) => l !== e.target.value);
      this.setState({ lfilter: copyLfilter});
      queryParams.set("l", copyLfilter);
  }
    else {
      lfilter.push(e.target.value);
      this.setState({ lfilter: lfilter });
      queryParams.set("l", lfilter);

    }
    window.history.pushState(null, null, "?"+queryParams.toString());
  }
  componentDidMount() {
    console.log(window.location.search.split('l=').pop().split('&').shift());
    console.log(window.location.search.split('c=').pop().split('&').shift());

    // console.log(this.state.cfilter)
    // console.log(this.state.lfilter)
    this.props.firebase.untutorials().on("value", (snapshot) => {
      const untutsObj = snapshot.val();
      const untutorials = Object.keys(untutsObj).map((key) => ({
        ...untutsObj[key],
        pid: key,
      }));
      this.setState({
        untutorials: untutorials,
        loading: false,
      });
    });
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("c", this.state.cfilter);
    queryParams.set("l", this.state.lfilter);
    window.history.pushState(null, null, "?"+queryParams.toString());
  
  }
  componentWillUnmount() {
    this.props.firebase.untutorials().off();
  }
  render() {
    const { untutorials, loading, cfilter, lfilter, textFilter } = this.state;
    var filteredUntutorials = untutorials.filter(
      (untutorial) =>
        untutorial.Status === "APPROVED" &&
        (cfilter.length === 0 ||
          cfilter.filter((f) =>
            Object.values(untutorial.Categories).includes(f)
          ).length > 0) &&
        (lfilter.length === 0 ||
          lfilter.filter((f) => f == "LEVEL" + untutorial.Level).length > 0) &&
        untutorial.Title.toLowerCase().includes(textFilter.toLowerCase())
    );
    var untutorialLevels = groupBy(filteredUntutorials, "Level");
    if (loading) return <div className="loading">Loading...</div>;
    //console.log("hiya")

    return (
      <section id="launchpad">
        <div className="main">
          <div className="sidebar">
            <div className="filter">
              {loading && <div className="loading">Loading ...</div>}
              <div>
			  <h2>Category</h2>

                {/* {" "} */}
                {Object.keys(FILTER).map((f) => (
                  <button
                    onClick={this.toggleCFilter}
                    value={f}
                    class={cfilter.includes(f) ? "f" : ""}
                  >
                    {FILTER[f]}
                  </button>
                ))}
              </div>
              <div>
				<h2>Level</h2>
                {Object.keys(LEVELS).map((f) => (
                  <button
                    onClick={this.toggleLFilter}
                    value={f}
                    class={lfilter.includes(f) ? "f" : ""}
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
              onChange={this.textFilterOnChange}
              placeholder="Search..."
            />
            <div className="items">
              {Object.keys(untutorialLevels).map((level) => (
                <>
                  <h1>{"Level " + level}</h1>

                  {untutorialLevels[level]
                    .sort((a, b) => a.Priority - b.Priority)
                    .map((untutorial) => (
                      <a
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
                          file={this.props.firebase.storage.ref(
                            "/public/" +
                              untutorial.Author +
                              "/" +
                              untutorial.ThumbnailFilename
                          )}
                        />
                        <div>
                          <h2
                            dangerouslySetInnerHTML={{
                              __html: untutorial.Title,
                            }}
                          />
                          <div
                            dangerouslySetInnerHTML={{
                              __html: untutorial.Description.replace(
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
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
}
export default withFirebase(LaunchPad);
