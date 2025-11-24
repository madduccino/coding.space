import React from "react";
import LazyImage from "../LazyImage";
import EmailLoader from "../EmailLoader";
import { Link } from "react-router-dom";
import { AuthUserContext } from "../Session";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import TCSEditor from "../TCSEditor";
import { v4 as uuidv4 } from "uuid";
import * as ROUTES from "../../constants/routes";
import * as FILTER from "../../constants/filter";
import { RGBA_ASTC_12x10_Format } from "three";
import "./profile.scss";
import { Helmet } from "react-helmet";

const TAB = {
  PROJECTS: 0,
  UNTUTORIALS: 1,
  EMAIL: 2,
  PROFILE: 3,
  PROGRESS: 4,
  NOTES: 5,
};
const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

class ProfilePageBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      loading: true,
      errors: {},
      untutorials: [],
      projects: [],
      progresses: [],
      profile: {},
      uploading: false,
      uploadPercent: 0,
      dirty: false,
      tab: TAB.PROFILE,
      showCat: "SCRATCH",
    };
    this.handleNotesOnChange = this.handleNotesOnChange.bind(this);
    this.handleNotesOnSave = this.handleNotesOnSave.bind(this);
    this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
    this.handleStatusOnSave = this.handleStatusOnSave.bind(this);
    this.handleAgeOnChange = this.handleAgeOnChange.bind(this);
    this.handleAgeValidate = this.handleAgeValidate.bind(this);
    this.handleAgeOnSave = this.handleAgeOnSave.bind(this);
    this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
    this.handleDisplayNameOnChange = this.handleDisplayNameOnChange.bind(this);
    this.handleDisplayNameValidate = this.handleDisplayNameValidate.bind(this);
    this.handleDisplayNameOnSave = this.handleDisplayNameOnSave.bind(this);
    this.handlePDescriptionOnChange =
      this.handlePDescriptionOnChange.bind(this);
    this.handlePDescriptionValidate =
      this.handlePDescriptionValidate.bind(this);
    this.handlePLangOnChange = this.handlePLangOnChange.bind(this);
    this.handlePLangOnSave = this.handlePLangOnSave.bind(this);

    this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);
    this.saveChangesHandler = this.saveChangesHandler.bind(this);
    this.copyText = this.copyText.bind(this);

    //this.onChange = editorState => this.setState({editorState});
    //console.log("hiya");
  }
  handleMouseEnter = (target) => {
    if (this.state.canEdit) {
      return; //replace control with rich text editor
    }
  };
  componentDidMount() {
    const { key } = this.props.match.params;
    var untuts = [];
    var projects = [];
    var progresses = [];
    // find firebase path definitions in firebase.js
    this.props.firebase.profile(key).on("value", (snapshot) => {
      // get user profile
      var rawProf = snapshot.val();
      if (!rawProf.Notes) rawProf.Notes = "";
      this.props.firebase.untutorials().once("value", (snapshot2) => {
        // get all the untutorials
        const { key } = this.props.match.params;
        const untutObj = snapshot2.val();
        const untutArr = Object.values(untutObj); // make all the untutorials an array
        untuts = untuts.concat(
          // Filter out the user's untutorials
          untutArr.filter((untutorial) => untutorial.Author === key)
        );
        this.props.firebase.projects().once("value", (snapshot3) => {
          // Get all the projects
          var projArr = Object.values(snapshot3.val());
          projects = projects.concat(
            // Filter out the user's projects
            projArr.filter((project) => project.Author === key)
          );
          this.props.firebase.progresses(key).once("value", (snapshot) => {
            var progObj = snapshot.val(); // Get all the progress
            progresses = [];
            if (!!progObj) {
              progresses = Object.values(snapshot.val()); // make all the progress an array
              progresses.forEach((p, i) => {
                // Add untutorial nodes to the progresses array
                progresses[i].Untutorial = untutObj[p.untut];
                progresses[i].Level = progresses[i].Untutorial.Level;
                progresses[i].Categories = progresses[i].Untutorial.Categories;
              });
            }

            this.setState({
              profile: rawProf,
              untutorials: untuts,
              projects: projects,
              progresses: progresses,
              loading: false,
            });
          });
        });
      });
    });
  }
  componentWillUnmount() {
    this.props.firebase.profile().off();
  }
  handleThumbnailUpload(event) {
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var pCopy = this.state.profile;
    const { authUser } = this.props;
    if (!!authUser && !!authUser.roles["STUDENT"] && !!!pCopy.roles["ADMIN"])
      pCopy.Status = "DRAFT";
    pCopy.ThumbnailFilename = uuidv4() + "." + ext;

    var storageRef = this.props.firebase.storage.ref(
      "/public/" + pCopy.key + "/" + pCopy.ThumbnailFilename
    );
    var task = storageRef.put(file);

    task.on(
      "state_changed",
      (snapshot) => {
        //update
        var percentage =
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes;
        this.setState({ uploadPercent: percentage, uploading: true });
      },
      (error) => {
        //error
        this.setState({ uploadPercent: 0, uploading: false });
      },
      () => {
        //complete
        this.setState(
          { uploadPercent: 0, uploading: false, profile: pCopy, dirty: true },
          this.saveChangesHandler
        );
      }
    );
  }
  handlePDescriptionOnChange(value) {
    var pCopy = this.state.profile;
    if (value !== pCopy.About) {
      pCopy.About = value;
      const { authUser } = this.props;
      if (!!authUser && !!authUser.roles["STUDENT"] && !!!pCopy.roles["ADMIN"])
        pCopy.Status = "DRAFT";
      this.setState(
        { project: pCopy, dirty: true },
        this.handlePDescriptionValidate
      );
    }
  }
  handlePDescriptionValidate() {
    const { errors, profile } = this.state;
    const text = profile.About.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["About"] = 'ABOUT.<span className="red">ISREQUIRED</span>';
    } else if (text.length < 20) {
      errors["About"] = 'ABOUT.<span className="red">IS2SHORT</span>';
    } else delete errors["About"];
    this.setState({ errors: errors });
  }
  handlePDescriptionOnSave() {
    this.saveChangesHandler();
  }
  handlePLangOnChange(value) {
    var pCopy = this.state.profile;
    if (value !== pCopy.lang) {
      pCopy.lang = value;
      const { authUser } = this.props;
      if (!!authUser && !!authUser.roles["STUDENT"] && !!!pCopy.roles["ADMIN"])
        pCopy.Status = "DRAFT";
      this.setState(
        { project: pCopy, dirty: true }
        // this.handlePDescriptionValidate
      );
    }
  }
  handlePLangOnSave() {
    this.saveChangesHandler();
  }
  handleAgeOnChange(value) {
    var pCopy = this.state.profile;
    if (value !== pCopy.Age) {
      pCopy.Age = value;
      const { authUser } = this.props;
      if (!!authUser && !!authUser.roles["STUDENT"] && !!!pCopy.roles["ADMIN"])
        pCopy.Status = "DRAFT";
      this.setState({ project: pCopy, dirty: true }, this.handleAgeValidate);
    }
  }
  handleAgeValidate() {
    const { errors } = this.state;
    if (this.state.profile.Age.length === 0 /* && isNaN(profile.Age)*/) {
      errors["Age"] = 'AGE.<span className="red">ISREQUIRED</span>';
    } else delete errors["Age"];
    this.setState({ errors: errors });
  }
  handleAgeOnSave() {
    this.saveChangesHandler();
  }
  handleDisplayNameOnChange(value) {
    var pCopy = this.state.profile;
    if (value !== pCopy.DisplayName) {
      pCopy.DisplayName = value;
      const { authUser } = this.props;
      if (!!authUser && !!authUser.roles["STUDENT"] && !!!pCopy.roles["ADMIN"])
        pCopy.Status = "DRAFT";
      this.setState(
        { project: pCopy, dirty: true },
        this.handleDisplayNameValidate
      );
    }
  }
  handleDisplayNameValidate() {
    const { errors, profile } = this.state;
    if (profile.DisplayName.length === 0) {
      errors["Name"] = 'NAME.<span className="red">ISREQUIRED</span>';
    } else if (profile.DisplayName.length < 4) {
      errors["Name"] = 'NAME.<span className="red">IS2SHORT</span>';
    } else delete errors["Name"];
    this.setState({ errors: errors });
  }
  handleDisplayNameOnSave() {
    this.saveChangesHandler();
  }
  handleStatusOnChange(value) {
    var pCopy = this.state.profile;
    if (value !== pCopy.Status) {
      pCopy.Status = value;
      this.setState({ profile: pCopy, dirty: true });
    }
  }
  handleStatusOnSave() {
    this.saveChangesHandler();
  }
  handleNotesOnChange(value) {
    var pCopy = this.state.profile;
    if (value !== pCopy.Notes) {
      pCopy.Notes = value;
      const { authUser } = this.props;
      if (!!authUser && !!authUser.roles["STUDENT"] && !!!pCopy.roles["ADMIN"])
        pCopy.Status = "DRAFT";
      this.setState({ project: pCopy, dirty: true });
    }
  }
  handleNotesOnSave() {
    this.saveChangesHandler();
  }
  saveChangesHandler(event) {
    const { errors } = this.state;
    const { key } = this.props.match.params;
    try {
      if (Object.keys(errors).length === 0) {
        this.props.firebase
          .profile(key)
          .set({
            ...this.state.profile,
          })
          .then(() => {
            console.log("Successfully Saved");
            this.setState({ dirty: false });
          })
          .catch((error) => console.log(error));
      } else {
        throw new Error("Missing fields");
      }
    } catch (err) {
      // if (errors["About"] == "") errors["About"] = "Missing About";
      // if (errors["Age"] == "") errors["Description"] = "Missing Age";
      // if (errors["Step0"] == "") errors["Step0"] = "Step 1 is Required.";
      // if (errors["Categories"] == "") errors["Categories"] = "Missing Category";
      console.log(errors);
    } finally {
      this.setState({ errors: errors });
    }
  }
  copyText(e) {
    this.textArea.select();
    document.execCommand("copy");
  }
  render() {
    const {
      untutorials,
      projects,
      loading,
      profile,
      progresses,
      tab,
      showCat,
    } = this.state;
    const { authUser } = this.props;
    const { key } = this.props.match.params;
    var projectLevels = groupBy(projects, "Level");
    var untutorialLevels = groupBy(untutorials, "Level");
    var progressLevels = groupBy(progresses, "Level");

    var progressCategories = groupBy(progresses, "Categories");
    if (loading) return <div className="loading">Loading ...</div>;

    //can edit

    return (
      <section id="profile">
        <Helmet>
          <title>
            {!!authUser &&
              authUser.Username.replace(/\./g, " ").replace(/\w\S*/g, (w) =>
                w.replace(/^\w/, (c) => c.toUpperCase())
              )}{" "}
            - Profile
          </title>
        </Helmet>
        <div className="main">
          <div className="highlights">
            <div className="avatar">
              {this.state.uploading && (
                <progress value={this.state.uploadPercent} max="100" />
              )}
              {!!profile.ThumbnailFilename &&
              profile.ThumbnailFilename !== "" &&
              !this.state.uploading ? (
                <LazyImage
                  id={profile.ThumbnailFilename}
                  file={this.props.firebase.storage.ref(
                    "/public/" + profile.key + "/" + profile.ThumbnailFilename
                  )}
                />
              ) : (
                <LazyImage
                  file={this.props.firebase.storage.ref("/public/rocket.png")}
                />
              )}
              {!!authUser &&
                (!!authUser.roles["ADMIN"] || authUser.uid === profile.key) && (
                  <label htmlFor="files" className="upload">
                    <input
                      id="files"
                      type="file"
                      onChange={this.handleThumbnailUpload}
                    />
                  </label>
                )}
            </div>
            <div className="container">
              <TCSEditor
                disabled={
                  !(
                    !!authUser &&
                    (!!authUser.roles["ADMIN"] || authUser.uid === profile.key)
                  )
                }
                className="display-name"
                type="plain"
                onEditorChange={this.handleDisplayNameOnChange}
                onEditorSave={this.handleDisplayNameOnSave}
                placeholder={"Display Name"}
                text={profile.DisplayName}
              />
              <div className="stats">
                <div>Open Projects</div>
                <div>Published Projects</div>
                <div>Untutorials</div>
                <div>Skills {untutorials[key]}</div>
              </div>
            </div>
          </div>
          <div className="menu">
            <div
              className={this.state.tab === TAB.PROFILE ? "selected" : ""}
              onClick={() => this.setState({ tab: TAB.PROFILE })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-person-circle"
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path
                  fill-rule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                />
              </svg>
              Profile
            </div>
            <div
              className={this.state.tab === TAB.PROGRESS ? "selected" : ""}
              onClick={() => this.setState({ tab: TAB.PROGRESS })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-file-bar-graph"
                viewBox="0 0 16 16"
              >
                <path d="M4.5 12a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1zm3 0a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1zm3 0a.5.5 0 0 1-.5-.5v-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-1z" />
                <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
              </svg>
              In Progress
            </div>

            <div
              className={this.state.tab === TAB.PROJECTS ? "selected" : ""}
              onClick={() => this.setState({ tab: TAB.PROJECTS })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-flag"
                viewBox="0 0 16 16"
              >
                <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z" />
              </svg>
              Published Projects
            </div>

            <div
              className={this.state.tab === TAB.UNTUTORIALS ? "selected" : ""}
              onClick={() => this.setState({ tab: TAB.UNTUTORIALS })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-book"
                viewBox="0 0 16 16"
              >
                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
              </svg>{" "}
              My Untutorials
            </div>
            {!!authUser &&
              (!!authUser.roles["ADMIN"] ||
                !!authUser.roles["TEACHER"] ||
                authUser.uid === profile.key) && (
                <div
                  className={this.state.tab === TAB.EMAIL ? "selected" : ""}
                  onClick={() => this.setState({ tab: TAB.EMAIL })}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-envelope"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z" />
                  </svg>
                  Email
                </div>
              )}
            {/* <div
              className={this.state.tab === TAB.NOTES ? "selected" : ""}
              onClick={() => this.setState({ tab: TAB.NOTES })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-journal"
                viewBox="0 0 16 16"
              >
                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
                <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
              </svg>{" "}
              Notes
            </div> */}
          </div>

          <div className="tabs">
            {tab === TAB.PROFILE && (
              <div className="tab profile">
                <div className="extended">
                  {!!authUser &&
                    (!!authUser.roles["ADMIN"] ||
                      !!authUser.roles["TEACHER"] ||
                      authUser.uid === profile.key) && (
                      <>
                        <div>
                          <h4>My Coding Space Username</h4>
                          {profile.Username}
                        </div>
                        <div>
                          <h4>My Coding Space Email</h4>
                          <textarea
                            rows="1"
                            ref={(textarea) => {
                              this.textArea = textarea;
                            }}
                            value={profile.Email}
                          />
                          <button onClick={this.copyText}>Copy</button>
                        </div>
                      </>
                    )}
                  <h4>External Logins</h4>
                  <TCSEditor
                    disabled={
                      !(
                        !!authUser &&
                        (!!authUser.roles["ADMIN"] ||
                          !!authUser.roles["TEACHER"] ||
                          authUser.uid === profile.key)
                      )
                    }
                    type="text"
                    onEditorChange={this.handleNotesOnChange}
                    onEditorSave={this.handleNotesOnSave}
                    placeholder={"Notes"}
                    text={profile.Notes}
                  />
                  <div>
                    <h4>Language</h4>
                    <TCSEditor
                      disabled={
                        !(
                          !!authUser &&
                          (!!authUser.roles["ADMIN"] ||
                            authUser.uid === profile.key ||
                            authUser.roles["TEACHER"])
                        )
                      }
                      className={"block"}
                      type="select"
                      selectOptions={["English", "Español"]}
                      onEditorChange={this.handlePLangOnChange}
                      onEditorSave={this.handlePLangOnSave}
                      placeholder={"Language"}
                      text={profile.lang}
                    />
                  </div>
                  {/* <div>
                    <h4>My Age</h4>
                    <TCSEditor
                      disabled={
                        !(
                          !!authUser &&
                          (!!authUser.roles["ADMIN"] ||
                            authUser.uid === profile.key)
                        )
                      }
                      type="text"
                      onEditorChange={this.handleAgeOnChange}
                      onEditorSave={this.handleAgeOnSave}
                      placeholder={"I'm ___ years old!"}
                      text={profile.Age}
                    />
                  </div> */}
                  <div></div>

                  {/* <div>
                    <h4>About Me</h4>
                    <TCSEditor
                      disabled={
                        !(
                          !!authUser &&
                          (!!authUser.roles["ADMIN"] ||
                            authUser.uid === profile.key)
                        )
                      }
                      className={"block"}
                      type="text"
                      onEditorChange={this.handlePDescriptionOnChange}
                      onEditorSave={this.handlePDescriptionOnSave}
                      placeholder={"About Me"}
                      text={profile.About}
                    />
                  </div> */}
                </div>
              </div>
            )}
            {/* {tab === TAB.NOTES && (
              <div className="tab notes">
                {!!authUser &&
                  (!!authUser.roles["ADMIN"] ||
                    !!authUser.roles["TEACHER"] ||
                    authUser.uid === profile.key) && (
                    <>
                      <h4>Notes</h4>
                      <TCSEditor
                        disabled={
                          !(
                            !!authUser &&
                            (!!authUser.roles["ADMIN"] ||
                              !!authUser.roles["TEACHER"] ||
                              authUser.uid === profile.key)
                          )
                        }
                        type="text"
                        onEditorChange={this.handleNotesOnChange}
                        onEditorSave={this.handleNotesOnSave}
                        placeholder={"Notes"}
                        text={profile.Notes}
                      />
                    </>
                  )}
              </div>
            )} */}
            {tab === TAB.PROJECTS && (
              <div className="tab projects">
                <div className="content tab-content">
                  {projects.length < 1 && <p>{"No Projects Yet :("}</p>}
                  {Object.keys(projectLevels).map((group) => (
                    <>
                      <Accordion
                        group={group}
                        text={projectLevels[group].map((project) => (
                          <>
                            {(project.Status === "APPROVED") |
                            (!!authUser &&
                              (!!authUser.roles["ADMIN"] ||
                                authUser.uid === profile.key)) ? (
                              <Link
                                target="_blank"
                                to={project.URL}
                                id={project.key}
                              >
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: project.Title,
                                  }}
                                />
                                <div className="status">
                                  {project.Status === "APPROVED" ? (
                                    <i className="fa fa-flag green"></i>
                                  ) : (
                                    <div>Draft</div>
                                  )}
                                </div>
                                <div className="center">View</div>
                              </Link>
                            ) : (
                              ""
                            )}
                          </>
                        ))}
                      />
                    </>
                  ))}
                </div>
              </div>
            )}
            {tab === TAB.UNTUTORIALS && (
              <div className="tab untutorials">
                <div className="content tab-content">
                  {untutorials.length < 1 && <p>{"No Untutorials Yet :("}</p>}
                  {Object.keys(untutorialLevels).map((group) => (
                    <>
                      <Accordion
                        group={group}
                        categories={progressLevels}
                        text={untutorialLevels[group].map((untutorial) => (
                          <>
                            {(untutorial.Status === "APPROVED") |
                            (!!authUser &&
                              (!!authUser.roles["ADMIN"] ||
                                authUser.uid === profile.key)) ? (
                              <Link
                                id={untutorial.key}
                                to={ROUTES.LAUNCHPAD + "/" + untutorial.key}
                              >
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: untutorial.Title,
                                  }}
                                />
                                <div className="center">View</div>
                                <div className="status">
                                  {untutorial.Status === "APPROVED" ? (
                                    <i className="fa fa-flag green"></i>
                                  ) : (
                                    <div>Draft</div>
                                  )}
                                </div>
                              </Link>
                            ) : (
                              ""
                            )}
                          </>
                        ))}
                      />
                    </>
                  ))}
                </div>
              </div>
            )}
            {tab === TAB.PROGRESS && (
              <div className="tab progress">
                <div className="content tab-content">
                  {progresses.length < 1 ? (
                    <p>{"No Progress Yet :("}</p>
                  ) : (
                    <div className="instructions">
                      <div>
                        <span className="fa fa-star white"></span>
                        <p>to do</p>
                      </div>
                      <div>
                        <span className="fa fa-star pending fa-spin"></span>
                        <p>waiting for teacher to approve</p>
                      </div>
                      <div>
                        <span className="fa fa-star approved"></span>
                        <p>approved by teacher</p>
                      </div>

                      <div className="complete">
                        <img src="/images/rocket.png" />
                        <p>you finished!</p>
                      </div>
                    </div>
                  )}
                  <div className="projectList">
                    {
                      <div className="categories">
                        {Object.keys(FILTER).map(
                          (
                            // FILTER contains all the categories, sets state showCat to whatever category clicked
                            cat
                          ) => (
                            <div
                              className={showCat === cat ? "active" : ""}
                              onClick={() => this.setState({ showCat: cat })}
                            >
                              {FILTER[cat]}
                            </div>
                          )
                        )}
                      </div>
                    }
                    <div className="projects">
                      {Object.keys(progressLevels).map(
                        (
                          group // groups progress objects into level-based arrays
                        ) => (
                          <>
                            {progressLevels[group].some(
                              // show Level number if it exists in category
                              (progress) =>
                                Object.keys(progress.Categories).includes(
                                  showCat
                                ) && progress.Level == group
                            ) && <h2 className="level">Level {group}</h2>}
                            {/* <Accordion
                          group={group}
                          untuts={progressLevels}
                          text= */}

                            {progressLevels[group]
                              .sort((progress) => progress.LastModified) // sort according to most recent progress
                              .filter((f) =>
                                Object.keys(f.Categories).includes(
                                  // show only showCat state
                                  showCat
                                )
                              )
                              .map((progress) => (
                                <>
                                  {!!authUser &&
                                    (!!authUser.roles["ADMIN"] ||
                                      !!authUser.roles["TEACHER"] ||
                                      authUser.uid === profile.key) && (
                                      <Link
                                        id={progress.LastModified}
                                        to={
                                          authUser.uid === profile.key
                                            ? ROUTES.LAUNCHPAD +
                                              "/" +
                                              progress.Untutorial.key +
                                              "?loadProgress=true"
                                            : ROUTES.LAUNCHPAD +
                                              "/" +
                                              progress.Untutorial.key
                                        }
                                      >
                                        {/* <div
                                      dangerouslySetInnerHTML={{
                                        __html: `${progress.Untutorial.Title} 
                                       <p class="modified">Last modified: ${new Date(
                                         progress.Untutorial.LastModified
                                       ).toLocaleDateString()}</p>`,
                                      }}
                                    /> */}
                                        {console.log(
                                          typeof progress.Untutorial.Title
                                        )}
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: progress.Untutorial.Title,
                                          }}
                                        />

                                        <div className="status">
                                          {Object.keys(
                                            progress.Untutorial.steps
                                          ).map((slot) => (
                                            <>
                                              {!!progress.steps[slot] &&
                                              progress.steps[slot].Status ===
                                                "DRAFT" ? (
                                                <div className="fa fa-star white"></div>
                                              ) : !!progress.steps[slot] &&
                                                progress.steps[slot].Status ===
                                                  "PENDING" ? (
                                                <div className="fa fa-star pending fa-spin"></div>
                                              ) : (
                                                <div className="fa fa-star approved"></div>
                                              )}
                                            </>
                                          ))}
                                        </div>
                                        {progress.Status === "APPROVED" ? (
                                          <div className="complete">
                                            <img src="/images/rocket.png" />
                                          </div>
                                        ) : progress.Status === "PENDING" ? (
                                          "Waiting for Teacher Approval"
                                        ) : !!progress.nextStep ? (
                                          authUser.uid === profile.key ? (
                                            "Work on Step " + progress.nextStep
                                          ) : (
                                            `On Step ${progress.nextStep}`
                                          )
                                        ) : authUser.uid === profile.key ? (
                                          "Work on Project"
                                        ) : (
                                          "Not Started"
                                        )}
                                      </Link>
                                    )}
                                </>
                              ))}
                            {/* /> */}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!!authUser &&
              (!!authUser.roles["ADMIN"] ||
                !!authUser.roles["TEACHER"] ||
                authUser.uid === profile.key) &&
              tab === TAB.EMAIL && (
                <div className="tab email">
                  <div className="content tab-content">
                    <EmailLoader label={profile.Username} />
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>
    );
  }
}

class Accordion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }
  render() {
    const { collapsed } = this.state;

    return (
      <>
        <h3
          className={collapsed ? "down" : "up"}
          onClick={() => this.setState({ collapsed: !collapsed })}
        >
          Level {this.props.group}
        </h3>
        {!collapsed && <>{this.props.text}</>}
      </>
    );
  }
}

const ProfilePage = withFirebase(withAuthentication(ProfilePageBase));

export default ProfilePage;
