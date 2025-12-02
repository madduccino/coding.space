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
      activeProgress: {},
      pendingFilter: true,
      classFilter: false,
      classMembers: null,
      textFilter: "",
      allApproved: true,
    };
    this.onProfileActivate = this.onProfileActivate.bind(this);
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
      profile.key = snapshot.key;
      profiles.push(profile);
      this.setState({ profiles });
    });
  }

  componentWillUnmount() {
    this.props.firebase.profiles().off();
    this.props.firebase.class().off();
    // Clean up active progress listener if exists
    const { activeProgress } = this.state;
    if (activeProgress.uid) {
      this.props.firebase.progresses(activeProgress.uid).off();
    }
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
  onProfileActivate(uid) {
    const { activeProgress } = this.state;
    // Clean up previous listener if exists
    if (activeProgress.uid) {
      this.props.firebase.progresses(activeProgress.uid).off();
    }

    let newActiveProgress = { uid: uid, progresses: [] };
    this.setState({ activeProgress: newActiveProgress }, () => {
      this.props.firebase.progresses(uid).on("child_added", (snapshot) => {
        let untutProg = snapshot.val();

        this.props.firebase
          .untutorial(snapshot.key)
          .once("value", (snapshot2) => {
            let untutorial = snapshot2.val();
            newActiveProgress.progresses.push({
              untutorial: untutorial,
              steps: untutProg.steps,
              URL: untutProg.URL,
            });
            this.setState({ activeProgress: { ...newActiveProgress } });
          });
      });
    });
  }
  approveStep(uid, untutKey, pIndex, stepId, comments) {
    const { activeProgress } = this.state;
    this.props.firebase
      .progress(uid, untutKey)
      .child("steps")
      .child(stepId)
      .set({
        Comments: activeProgress.progresses[pIndex].steps[stepId].Comments,
        Status: "APPROVED",
      })
      .then(() => {
        console.log("Step Approved. Yay!");
        const updatedProgress = { ...activeProgress };
        updatedProgress.progresses[pIndex].steps[stepId].Status = "APPROVED";
        this.setState({ activeProgress: updatedProgress });
      })
      .catch((err) => {
        console.log("NOOOOOoooo");
      });
  }
  disapproveStep(uid, untutKey, pIndex, stepId, comments) {
    const { activeProgress } = this.state;

    this.props.firebase
      .progress(uid, untutKey)
      .child("steps")
      .child(stepId)
      .set({
        Comments: activeProgress.progresses[pIndex].steps[stepId].Comments,
        Status: "DRAFT",
      })
      .then(() => {
        console.log("Step Disapproved. Yay!");
        const updatedProgress = { ...activeProgress };
        updatedProgress.progresses[pIndex].steps[stepId].Status = "DRAFT";
        this.setState({ activeProgress: updatedProgress });
      })
      .catch((err) => {
        console.log("NOOOOOoooo");
      });
  }
  onFeedbackUpdate(uid, untutKey, pIndex, stepId, value) {
    const { activeProgress } = this.state;
    if (activeProgress.progresses[pIndex].steps[stepId].Comments != value) {
      const updatedProgress = { ...activeProgress };
      updatedProgress.progresses[pIndex].steps[stepId].Comments = value;
      this.setState({ activeProgress: updatedProgress });
    }
  }
  render() {
    const {
      profiles,
      activeProgress,
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

    //console.log("hiya")
    return (
      <section id="progress-reviews">
        <div className="main">
          <div className="sidebar">
            <div className="filters">
              <input
                className="search"
                type="text"
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
              {textFilter.length === 0 && !classFilter ? (
                <li>
                  <p>Enter a name in the search bar to find a student</p>
                </li>
              ) : (
                filteredProfiles.map((profile) => (
                  <li key={profile.key}>
                    <h3 onClick={() => this.onProfileActivate(profile.key)}>
                      {profile.Username}
                    </h3>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="main-content">
            <h1>Student Progress</h1>
            {!activeProgress.uid ? (
              <p>Select a student from the sidebar to view progress</p>
            ) : activeProgress.progresses.length === 0 ? (
              <p>No progress yet</p>
            ) : (
              <div className="grid-container">
                {filteredProfiles
                  .filter((profile) => profile.key === activeProgress.uid)
                  .map((profile) => (
                  <React.Fragment key={profile.key}>
                    {activeProgress.progresses
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
