import React from "react";

import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import * as ROLES from "../../constants/roles";
import TCSEditor from "../TCSEditor";
import { v4 as uuidv4 } from "uuid";
import "./progress.scss";

class ProgressReviews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profiles: [],
      steps: [],
      allProgress: {},
      pendingFilter: true,
      classFilter: false,
      classMembers: null,
      textFilter: "",
      allApproved: true,
    };
    this.loadProfileProgress = this.loadProfileProgress.bind(this);
    this.approveStep = this.approveStep.bind(this);
    this.onFeedbackUpdate = this.onFeedbackUpdate.bind(this);
    this.onPendingFilterChange = this.onPendingFilterChange.bind(this);
    this.onTextFilterChange = this.onTextFilterChange.bind(this);
    this.onClassFilterChange = this.onClassFilterChange.bind(this);
  }

  componentDidMount() {
    const { profiles } = this.state;
    //classes too
    this.props.firebase.profiles().on("child_added", (snapshot) => {
      let profile = snapshot.val();
      profiles.push(profile);
      this.loadProfileProgress(profile.key);
    });
  }

  componentWillUnmount() {
    this.props.firebase.profiles().off();
    this.props.firebase.class().off();
    // Clean up progress listeners for all profiles
    const { profiles } = this.state;
    profiles.forEach((profile) => {
      this.props.firebase.progresses(profile.key).off();
    });
  }
  onPendingFilterChange() {
    const { pendingFilter } = this.state;
    this.setState({ pendingFilter: !pendingFilter });
  }
  onTextFilterChange(event) {
    const { textFilter } = this.state;
    if (textFilter != event.target.value)
      this.setState({ textFilter: event.target.value });
  }
  onClassFilterChange() {
    const { classFilter, classMembers } = this.state;
    const { authUser } = this.props;
    if (classFilter) this.setState({ classFilter: false });
    else {
      if (!classMembers) {
        this.props.firebase.classes().once("value", (snapshot) => {
          let classMembers = [];
          let classes = snapshot.val();

          let classesWithYou = Object.keys(classes).filter((clazz) =>
            Object.keys(classes[clazz].Members).includes(authUser.uid)
          );
          if (Object.keys(classesWithYou).length > 0) {
            classesWithYou.forEach((clazz) => {
              classMembers = classMembers.concat(
                Object.keys(classes[clazz].Members)
              );
            });
            this.setState({ classMembers: classMembers, classFilter: true });
          }
        });
      } else this.setState({ classFilter: true });
    }
  }
  loadProfileProgress(uid) {
    const { allProgress } = this.state;
    if (!allProgress[uid]) {
      allProgress[uid] = { progresses: [] };
    }

    this.props.firebase.progresses(uid).on("child_added", (snapshot) => {
      let untutProg = snapshot.val();

      this.props.firebase
        .untutorial(snapshot.key)
        .once("value", (snapshot2) => {
          let untutorial = snapshot2.val();
          allProgress[uid].progresses.push({
            untutorial: untutorial,
            steps: untutProg.steps,
            URL: untutProg.URL,
          });
          this.setState({ allProgress: { ...allProgress } });
        });
    });
  }
  approveStep(uid, untutKey, pIndex, stepId, comments) {
    const { allProgress } = this.state;
    this.props.firebase
      .progress(uid, untutKey)
      .child("steps")
      .child(stepId)
      .set({
        Comments: allProgress[uid].progresses[pIndex].steps[stepId].Comments,
        Status: "APPROVED",
      })
      .then(() => {
        console.log("Step Approved. Yay!");
        const updatedProgress = { ...allProgress };
        updatedProgress[uid].progresses[pIndex].steps[stepId].Status = "APPROVED";
        this.setState({ allProgress: updatedProgress });
      })
      .catch((err) => {
        console.log("NOOOOOoooo");
      });
  }
  disapproveStep(uid, untutKey, pIndex, stepId, comments) {
    const { allProgress } = this.state;

    this.props.firebase
      .progress(uid, untutKey)
      .child("steps")
      .child(stepId)
      .set({
        Comments: allProgress[uid].progresses[pIndex].steps[stepId].Comments,
        Status: "DRAFT",
      })
      .then(() => {
        console.log("Step Disapproved. Yay!");
        const updatedProgress = { ...allProgress };
        updatedProgress[uid].progresses[pIndex].steps[stepId].Status = "DRAFT";
        this.setState({ allProgress: updatedProgress });
      })
      .catch((err) => {
        console.log("NOOOOOoooo");
      });
  }
  onFeedbackUpdate(uid, untutKey, pIndex, stepId, value) {
    const { allProgress } = this.state;
    if (allProgress[uid].progresses[pIndex].steps[stepId].Comments != value) {
      const updatedProgress = { ...allProgress };
      updatedProgress[uid].progresses[pIndex].steps[stepId].Comments = value;
      this.setState({ allProgress: updatedProgress });
    }
  }
  render() {
    const {
      profiles,
      allProgress,
      pendingFilter,
      classFilter,
      classMembers,
      textFilter,
    } = this.state;
    const { authUser } = this.props;

    const filteredProfiles = profiles
      .sort((profile) => profile.DisplayName)
      .filter(
        (profile) =>
          (classFilter ? classMembers.includes(profile.key) : true) &&
          (textFilter.length == 0 ||
            profile.Username.toLowerCase().includes(
              textFilter.toLowerCase()
            ) ||
            profile.DisplayName.toLowerCase().includes(
              textFilter.toLowerCase()
            ))
      );

    const hasAnyProgress = filteredProfiles.some(
      (profile) => allProgress[profile.key] && allProgress[profile.key].progresses.length > 0
    );

    //console.log("hiya")
    return (
      <section id="progress-reviews">
        <div className="main">
          <div className="sidebar">
            <div className="filters">
              <input
                className="search"
                type="textFilter"
                value={textFilter}
                onChange={this.onTextFilterChange}
                placeholder="Search..."
              />
              <div>
                <input
                  type="checkbox"
                  checked={pendingFilter}
                  onClick={this.onPendingFilterChange}
                />
                <label>Pending Steps Only</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={classFilter}
                  onClick={this.onClassFilterChange}
                />
                <label>Your Class Only</label>
              </div>
            </div>
            <ul>
              {filteredProfiles.map((profile) => (
                <li key={profile.key}>
                  <h3>{profile.Username}</h3>
                </li>
              ))}
            </ul>
          </div>
          <div className="main-content">
            <h1>Student Progress</h1>
            {!hasAnyProgress ? (
              <p>No progress yet</p>
            ) : (
              <div className="grid-container">
                {filteredProfiles.map((profile) => (
                  <React.Fragment key={profile.key}>
                    {allProgress[profile.key] &&
                      allProgress[profile.key].progresses
                        .filter((progress) => true)
                        .map((progress, pIndex) => (
                          <div
                            key={profile.key + progress.untutorial.key}
                            id={profile.key + progress.untutorial.key}
                            className="project"
                          >
                            <div className="aside">
                              <h3
                                dangerouslySetInnerHTML={{
                                  __html: progress.untutorial.Title,
                                }}
                              />

                              <p style={{ fontSize: "14px" }}>Started</p>

                              {!!progress.URL && progress.URL != "" && (
                                <a href={progress.URL} target={"_blank"}>
                                  View Project
                                </a>
                              )}
                            </div>

                            {progress.steps.length > 0 &&
                              progress.steps.map((step, i) => (
                                <React.Fragment key={progress.untutorial.key + "" + i}>
                                  {(!pendingFilter ||
                                    (pendingFilter &&
                                      step.Status === "PENDING")) && (
                                    <div id={progress.untutorial.key + "" + i}>
                                      <div className="status">
                                        Step {i + 1}
                                        {progress.untutorial.steps[i].Title
                                          ? `: ${progress.untutorial.steps[i].Title}`
                                          : ""}
                                        <span
                                          className={
                                            step.Status === "PENDING"
                                              ? "pending"
                                              : step.Status === "APPROVED"
                                              ? "approved"
                                              : "todo"
                                          }
                                        ></span>
                                      </div>
                                      {step.Status == "PENDING" && (
                                        <div className="giveFeedback">
                                          <textarea
                                            id={
                                              "feedback-" +
                                              progress.untutorial.key +
                                              "" +
                                              i
                                            }
                                            type="text"
                                            value={step.Comments}
                                            placeholder="Feedback..."
                                            onChange={(event) =>
                                              this.onFeedbackUpdate(
                                                profile.key,
                                                progress.untutorial.key,
                                                pIndex,
                                                i,
                                                event.target.value
                                              )
                                            }
                                          />
                                          <div>
                                            <button
                                              className="approve"
                                              id={
                                                "approve-" +
                                                progress.untutorial.key +
                                                "" +
                                                i
                                              }
                                              onClick={() =>
                                                this.approveStep(
                                                  profile.key,
                                                  progress.untutorial.key,
                                                  pIndex,
                                                  i
                                                )
                                              }
                                            >
                                              Approve
                                            </button>
                                            <button
                                              className="disapprove"
                                              id={
                                                "disapprove-" +
                                                progress.untutorial.key +
                                                "" +
                                                i
                                              }
                                              onClick={() =>
                                                this.disapproveStep(
                                                  profile.key,
                                                  progress.untutorial.key,
                                                  pIndex,
                                                  i
                                                )
                                              }
                                            >
                                              Send Back
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
                        ))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}
var condition = (authUser) =>
  authUser &&
  (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
export default withFirebase(withAuthorization(condition)(ProgressReviews));
