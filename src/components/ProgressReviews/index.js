import React from "react";


import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import * as ROLES from "../../constants/roles";
import TCSEditor from "../TCSEditor";
import { v4 as uuidv4 } from "uuid";

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
	  allApproved: true
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
      profiles.push(profile);
    });
  }

  componentWillUnmount() {
    this.props.firebase.profiles().off();
    this.props.firebase.class().off();
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
    const { profiles } = this.state;
    let activeProgress = {};
    activeProgress.progresses = [];
    activeProgress.uid = 0;
    this.setState({ activeProgress: activeProgress }, () => {
      this.props.firebase.progresses(uid).on("child_added", (snapshot) => {
        let untutProg = snapshot.val();

        this.props.firebase
          .untutorial(snapshot.key)
          .once("value", (snapshot2) => {
            let untutorial = snapshot2.val();
            activeProgress.uid = uid;
            activeProgress.progresses.push({
              untutorial: untutorial,
              steps: untutProg.steps,
              URL: untutProg.URL,
            });
            this.setState({ activeProgress: activeProgress });
          });
      });
    });
  }
  approveStep(uid, untutKey, pIndex, stepId, comments) {
    const { activeProgress } = this.state;
    var apCopy = activeProgress;
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
        apCopy.progresses[pIndex].steps[stepId].Status = "APPROVED";
        this.setState({ activeProgress: apCopy });
      })
      .catch((err) => {
        console.log("NOOOOOoooo");
      });
  }
  disapproveStep(uid, untutKey, pIndex, stepId, comments) {
    const { activeProgress } = this.state;
    var apCopy = activeProgress;

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
        apCopy.progresses[pIndex].steps[stepId].Status = "DRAFT";
        this.setState({ activeProgress: apCopy });
      })
      .catch((err) => {
        console.log("NOOOOOoooo");
      });
  }
  onFeedbackUpdate(uid, untutKey, pIndex, stepId, value) {
    const { activeProgress } = this.state;
    let pCopy = activeProgress;
    if (activeProgress.progresses[pIndex].steps[stepId].Comments != value) {
      pCopy.progresses[pIndex].steps[stepId].Comments = value;
      this.setState({ activeProgress: pCopy });
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
              {profiles
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
                )
                .map((profile) => (
                  <li>
                    <h3
                      onClick={() => this.onProfileActivate(profile.key)}
                      onHover={() => this.onProfileActivate(profile.key)}
                    >
                      {profile.Username}
                    </h3>
                  </li>
                ))}
            </ul>
          </div>
          <div className="main-content">
            <h1>Student Progress</h1>

            {profiles
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
              )
              .map((profile) => (
                <>
                  {!!activeProgress.uid &&
                    activeProgress.uid === profile.key &&
                    activeProgress.progresses
                      .filter((progress) => true)
                      .map((progress, pIndex) => (
                        <div id={profile.key + progress.untutorial.key} className="project">
                          <div className="aside">
                            <h3
                              dangerouslySetInnerHTML={{
                                __html: progress.untutorial.Title,
                              }}
                            />
							{console.log(progress.untutorial.Status)}

                            {progress.steps.length <= 0 && <h4>No Progress</h4>}
                            
							{!!progress.URL && progress.URL != "" && (
                              <a href={progress.URL} target={"_blank"}>
                                View Project
                              </a>
                            )}
                          </div>

                          {progress.steps.length > 0 &&
                            progress.steps.map((step, i) => (
                              <>
						
						
                                {(!pendingFilter ||
                                  (pendingFilter &&
                                    step.Status === "PENDING")) && (
                                  <div id={progress.untutorial.key + "" + i} >
                                    <div className="status">
                                      Step {i + 1}: {progress.untutorial.steps[i].Title}
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
                                          <button className="approve"
                                            id={
                                              "approve-" +
                                              progress.untutorial.key +
                                              "" +
                                              i
                                            }
                                            onClick={() =>
                                              this.approveStep(
                                                activeProgress.uid,
                                                progress.untutorial.key,
                                                pIndex,
                                                i
                                              )
                                            }
                                          >
                                            Approve 
                                          </button>
                                          <button className="disapprove"
                                            id={
                                              "disapprove-" +
                                              progress.untutorial.key +
                                              "" +
                                              i
                                            }
                                            onClick={() =>
                                              this.disapproveStep(
                                                activeProgress.uid,
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
                              </>
                            ))}
                        </div>
                      ))}
                </>
              ))}
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
