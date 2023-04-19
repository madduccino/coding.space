import React from "react";
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

class UntutorialPageBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      loading: true,
      untutorial: {},
      errors: {},
      error: null,
      progress: null,
      dirty: false,
      uploading: false,
      uploadPercent: 0,
      showiframe: true,
      lang: this.props.authUser ? this.props.authUser.lang : "English",
      languageSelect: true,
      init: false,
    };
    this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
    this.handleStatusOnSave = this.handleStatusOnSave.bind(this);
    this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
    this.handleStepThumbnailUpload = this.handleStepThumbnailUpload.bind(this);
    this.handleTitleOnChange = this.handleTitleOnChange.bind(this);
    this.handleTitleOnSave = this.handleTitleOnSave.bind(this);
    this.handleDescriptionOnChange = this.handleDescriptionOnChange.bind(this);
    this.handleDescriptionOnSave = this.handleDescriptionOnSave.bind(this);
    this.handleLevelOnChange = this.handleLevelOnChange.bind(this);
    this.handleLevelOnSave = this.handleLevelOnSave.bind(this);
    this.handlePriorityOnChange = this.handlePriorityOnChange.bind(this);
    this.handlePriorityOnSave = this.handlePriorityOnSave.bind(this);
    this.handleStepTitleOnChange = this.handleStepTitleOnChange.bind(this);
    this.handleStepTitleOnSave = this.handleStepTitleOnSave.bind(this);
    this.handleStepOnChange = this.handleStepOnChange.bind(this);
    this.handleStepOnSave = this.handleStepOnSave.bind(this);
    this.addStepHandler = this.addStepHandler.bind(this);
    this.deleteStepHandler = this.deleteStepHandler.bind(this);
    this.saveChangesHandler = this.saveChangesHandler.bind(this);
    this.saveProgressHandler = this.saveProgressHandler.bind(this);
    this.validateTitle = this.validateTitle.bind(this);
    this.validateStatus = this.validateStatus.bind(this);
    this.validateDescription = this.validateDescription.bind(this);
    this.handlePCategoryOnChange = this.handlePCategoryOnChange.bind(this);
    this.handleCategoryValidate = this.handleCategoryValidate.bind(this);
    this.handleCategoryOnClick = this.handleCategoryOnClick.bind(this);
    this.handleSkillsOnChange = this.handleSkillsOnChange.bind(this);
    this.handleSkillsValidate = this.handleSkillsValidate.bind(this);
    this.handleSkillsOnClick = this.handleSkillsOnClick.bind(this);
    this.handleProgressURLOnChange = this.handleProgressURLOnChange.bind(this);
    this.handleProgressURLOnSave = this.handleProgressURLOnSave.bind(this);
    this.validatePriority = this.validatePriority.bind(this);
    this.validateLevel = this.validateLevel.bind(this);
    this.validateStep = this.validateStep.bind(this);
    this.loadProgress = this.loadProgress.bind(this);
    this.deleteProjectHandler = this.deleteProjectHandler.bind(this);
    this.studentApprove = this.studentApprove.bind(this);
    this.chooseLang = this.chooseLang.bind(this);
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.updateLang = this.updateLang.bind(this);

    //this.onChange = editorState => this.setState({editorState});
    //console.log("hiya");
  }
  handleMouseEnter = (target) => {
    if (this.state.canEdit) {
      return; //replace control with rich text editor
    }
  };

  handleClick = (e) => {
    const { showiframe } = this.state;
    if (e.target.className === "iframe-on") {
      this.setState({ showiframe: false });
    }
  };

  componentDidMount() {
    //console.log(this.authUser);
    document.body.addEventListener("click", this.handleClick);

    const { key } = this.props.match.params;
    this.props.firebase.untutorial(key).on("value", (snapshot) => {
      const untutorial = snapshot.val();
      this.props.firebase
        .profile(untutorial.Author)
        .once("value")
        .then((snapshot2) => {
          const author = snapshot2.val();
          untutorial.Author = author;
          this.setState(
            {
              untutorial: untutorial,
              loading: false,
            },
            () =>
              this.props.location.search.includes("loadProgress")
                ? this.loadProgress()
                : null
          );
        });
    });
  }

  componentDidUpdate() {
    const { lang, init } = this.state;
    if (this.props.authUser && !init && lang != this.props.authUser.lang) {
      this.setState({ init: true, lang: this.props.authUser.lang });
    }
  }

  loadProgress() {
    const { authUser } = this.props;
    const { untutorial, showiframe } = this.state;
    const { key } = this.props.match.params;
    if (!!authUser) {
      this.props.firebase
        .progress(authUser.uid, untutorial.key)
        .on("value", (snapshot) => {
          if (snapshot.exists()) {
            let progress = snapshot.val();
            if (!progress.steps) progress.steps = [];
            this.setState({ progress: progress });
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
              this.setState({ progress: progress });
            });
          }
        });
    }
    if (showiframe) this.setState({ showiframe: false });
  }
  componentWillUnmount() {
    //this.props.firebase.proj().off();
    this.props.firebase.untutorial().off();
  }
  handleThumbnailUpload(event) {
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var oCopy = this.state.untutorial;
    const { authUser } = this.props;
    if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
    oCopy.ThumbnailFilename = uuidv4() + "." + ext;

    var storageRef = this.props.firebase.storage.ref(
      "/public/" + oCopy.Author.key + "/" + oCopy.ThumbnailFilename
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
          {
            uploadPercent: 0,
            uploading: false,
            untutorial: oCopy,
            dirty: true,
          },
          this.saveChangesHandler
        );
      }
    );
  }
  handleStepThumbnailUpload(event, step) {
    const { lang } = this.state;
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var oCopy = this.state.untutorial;
    const { authUser } = this.props;
    if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
    if (lang === "Español") {
      oCopy.steps[step].ThumbnailFilenameSp = uuidv4() + "." + ext;
      var storageRef = this.props.firebase.storage.ref(
        "/public/" +
          oCopy.Author.key +
          "/" +
          oCopy.steps[step].ThumbnailFilenameSp
      );
    } else {
      oCopy.steps[step].ThumbnailFilename = uuidv4() + "." + ext;
      var storageRef = this.props.firebase.storage.ref(
        "/public/" +
          oCopy.Author.key +
          "/" +
          oCopy.steps[step].ThumbnailFilename
      );
    }
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
        console.log(error);
        this.setState({ uploadPercent: 0, uploading: false });
      },
      () => {
        //complete
        this.setState(
          {
            uploadPercent: 0,
            uploading: false,
            untutorial: oCopy,
            dirty: true,
          },
          this.saveChangesHandler
        );
      }
    );
  }
  handleTitleOnChange(value) {
    var oCopy = this.state.untutorial;
    const { lang } = this.state;
    if (lang === "Español") {
      if (value !== oCopy.TitleEs) {
        oCopy.TitleEs = value;
      }
    } else {
      if (value !== oCopy.Title) {
        oCopy.Title = value;
      }
      const { authUser } = this.props;
      if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
      this.setState({ untutorial: oCopy, dirty: true });
      this.validateTitle();
    }
  }

  handleTitleOnSave(value) {
    this.saveChangesHandler();
  }
  validateTitle() {
    const { untutorial, errors, lang } = this.state;
    const { Title, TitleEs } = untutorial;

    const text = Title ? Title.replace(/<(.|\n)*?>/g, "").trim() : "";
    const textEs = TitleEs ? TitleEs.replace(/<(.|\n)*?>/g, "").trim() : "";

    if (lang === "English") {
      if (text.length === 0) {
        errors["Title"] = 'TITLE.<span className="red">ISREQUIRED</span>';
      } else {
        delete errors["Title"];
      }
    }
    if (lang === "Español") {
      if (textEs.length === 0) {
        errors["TitleEs"] = 'TITLE.<span className="red">ISREQUIRED</span>';
      } else {
        delete errors["TitleEs"];
      }
    }
    this.setState({ errors: errors });
  }

  handleDescriptionOnChange(value) {
    var oCopy = this.state.untutorial;
    const { lang } = this.state;
    if (lang === "Español") {
      if (value !== oCopy.DescriptionEs) {
        oCopy.DescriptionEs = value;
      }
    } else {
      if (value !== oCopy.Description) {
        oCopy.Description = value;
      }
    }
    const { authUser } = this.props;
    if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
    this.setState({ untutorial: oCopy, dirty: true });
    this.validateDescription();
  }

  handleDescriptionOnSave(value) {
    this.saveChangesHandler();
  }
  validateDescription() {
    const { untutorial, errors, lang } = this.state;
    const { Description, DescriptionEs } = untutorial;
    const text = Description;
    const textEs = DescriptionEs;

    if (lang === "English") {
      if (text === "") {
        errors["Description"] = "Description is required.";
      } else {
        delete errors["Description"];
      }
    }
    if (lang === "Español") {
      if (textEs === "") {
        errors["DescriptionEs"] = "Description is required.";
      } else {
        delete errors["DescriptionEs"];
      }
    }
    this.setState({ errors: errors });
  }
  handleStatusOnChange(value) {
    var oCopy = this.state.untutorial;
    if (value !== oCopy.Status) {
      oCopy.Status = value;
      this.setState({ untutorial: oCopy, dirty: true });
      this.validateStatus();
    }
  }
  handleStatusOnSave(event) {
    this.saveChangesHandler();
  }
  validateStatus() {
    const { untutorial, errors } = this.state;
    const { Status } = untutorial;
    if (!["DRAFT", "APPROVED"].includes(Status)) {
      errors["Status"] = 'STATUS.<span className="red">ISINVALID</span>';
    } else {
      delete errors["Status"];
    }
    this.setState({ errors: errors });
  }

  handleSkillsOnChange(event) {
    const { untutorial, error } = this.state;

    if (event.target.value != "-1") {
      untutorial.Skills[event.target.value] = event.target.value;
      this.setState({ untutorial: untutorial }, this.handleSkillsValidate);
    }
  }
  handleSkillsOnClick(text) {
    const { untutorial } = this.state;
    delete untutorial.Skills[text];
    this.setState({ untutorial: untutorial }, this.handleSkillsValidate);
  }
  handleSkillsValidate() {
    const { untutorial, error } = this.state;
    try {
      if (Object.keys(untutorial.Skills).length < 1) {
        throw "At least one skill required";
      } else {
        this.saveChangesHandler();
        this.setState({ error: "" });
      }
    } catch (error) {
      this.setState({ error: error });
    }
  }

  handlePCategoryOnChange(event) {
    const { untutorial, error } = this.state;

    if (event.target.value != "-1") {
      untutorial.Categories[event.target.value] = event.target.value;
      this.setState({ untutorial: untutorial }, this.handleCategoryValidate);
    }
  }
  handleCategoryOnClick(text) {
    const { untutorial } = this.state;
    delete untutorial.Categories[text];
    this.setState({ untutorial: untutorial }, this.handleCategoryValidate);
  }
  handleCategoryValidate() {
    const { untutorial, error } = this.state;
    try {
      if (Object.keys(untutorial.Categories).length < 1) {
        throw "At least one category required";
      } else {
        this.saveChangesHandler();
        this.setState({ error: "" });
      }
    } catch (error) {
      this.setState({ error: error });
    }
  }
  handleLevelOnChange(value) {
    var oCopy = this.state.untutorial;
    if (value !== oCopy.Level) {
      oCopy.Level = value;
      const { authUser } = this.props;
      if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";

      this.setState({ untutorial: oCopy, dirty: true }, this.validateLevel);
    }
  }
  handleLevelOnSave(event) {
    this.saveChangesHandler();
  }
  validateLevel() {
    const { untutorial, errors } = this.state;
    const { Level } = untutorial;
    if (isNaN(Level)) {
      errors["Level"] = 'LEVEL.<span className="red">ISINVALID</span>';
    }
    if (![1, 2, 3, 4, 5, 6].includes(parseInt(Level))) {
      errors["Level"] = 'LEVEL.<span className="red">ISOUTSIDERANGE</span>';
    } else {
      delete errors["Level"];
    }
    this.setState({ errors: errors });
  }
  handlePriorityOnChange(value) {
    var oCopy = this.state.untutorial;
    if (value !== oCopy.Priority) {
      oCopy.Priority = value;
      const { authUser } = this.props;
      if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";

      this.setState({ untutorial: oCopy, dirty: true }, this.validatePriority);
    }
  }
  handlePriorityOnSave(event) {
    this.saveChangesHandler();
  }
  validatePriority() {
    const { untutorial, errors } = this.state;
    const { Priority } = untutorial;
    if (isNaN(Priority)) {
      errors["Priority"] = 'PRIORITY.<span className="red">ISINVALID</span>';
    }
    if (![1, 2, 3, 4, 5, 6].includes(parseInt(Priority))) {
      errors["Priority"] =
        'PRIORITY.<span className="red">ISOUTSIDERANGE</span>';
    } else {
      delete errors["Priority"];
    }
    this.setState({ errors: errors });
  }
  handleStepTitleOnChange(value, step) {
    var oCopy = this.state.untutorial;
    const { lang } = this.state;
    if (value !== oCopy.steps[step].Title) {
      lang === "Español"
        ? (oCopy.steps[step].TitleEs = value)
        : (oCopy.steps[step].Title = value);
      const { authUser } = this.props;
      if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
      this.setState({ untutorial: oCopy, dirty: true });
      //this.validateStep(step);
    }
  }
  handleStepTitleOnSave(value, step) {
    this.saveChangesHandler();
  }
  handleStepOnChange(value, step) {
    var oCopy = this.state.untutorial;
    const { lang } = this.state;
    if (value !== oCopy.steps[step].DescriptionEs) {
      if (lang === "Español") {
        oCopy.steps[step].DescriptionEs = value;
      }
    }
    if (value !== oCopy.steps[step].Description) {
      oCopy.steps[step].Description = value;
    }
    const { authUser } = this.props;
    if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
    this.setState({ untutorial: oCopy, dirty: true });
    // this.validateStep(step);
  }

  handleStepOnSave(value, step) {
    this.saveChangesHandler();
  }
  // Ignoring validateStep for now
  validateStep(index) {
    const { untutorial, errors } = this.state;
    const Step = untutorial.steps[index];
    const text = Step.Description.replace(/<(.|\n)*?>/g, "").trim();
    console.log(text);
    if (text === "") {
      errors["STEP" + index] =
        'STEP.<span className="orange">' +
        index +
        '</span>.<span className="red">ISREQUIRED</span>';
    }
    if (text.length < 20) {
      errors["STEP" + index] =
        'STEP.<span className="orange">' +
        index +
        '</span>.<span className="red">ISTOOSHORT</span>';
    } else {
      delete errors["STEP" + index];
    }
    this.setState({ errors: errors });
  }
  validateProjectURL() {
    const { untutorial, errors, project } = this.state;
    const { authUser } = this.props;

    if (project.URL === "") {
      errors["PROJECT_URL"] =
        'PROJECT_URL.<span className="red">ISREQUIRED</span>';
    } else if (
      !project.URL.match(
        /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i
      )
    ) {
      errors["PROJECT_URL"] =
        'PROJECT_URL.<span className="red">ISINVALID</span>';
    } else {
      delete errors["PROJECT_URL"];
    }
    this.setState({ errors: errors });
  }
  deleteStepHandler(event, key) {
    var oCopy = this.state.untutorial;
    const { authUser } = this.props;
    if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
    delete oCopy.steps[key];
    //shift steps up
    var newSteps = [];
    var steps = Object.values(oCopy.steps);
    steps.forEach((step, i) => {
      newSteps[i] = step;
    });
    oCopy.steps = newSteps;

    this.setState({ untutorial: oCopy, dirty: true }, this.saveChangesHandler);
  }
  addStepHandler(event) {
    var oCopy = this.state.untutorial;
    const { authUser } = this.props;
    if (authUser && !!authUser.roles["STUDENT"]) oCopy.Status = "DRAFT";
    oCopy.steps[Math.max(...Object.keys(oCopy.steps)) + 1] = {
      Description: "",
    };
    this.setState({ untutorial: oCopy, dirty: true }, this.saveChangesHandler);
    console.log("Add Step");
  }
  deleteProjectHandler() {
    const { key } = this.props.match.params;
    this.props.firebase.untutorial(key).remove();
    window.location = ROUTES.LANDING;
  }
  saveChangesHandler(event) {
    const { untutorial, loading, author, errors, error } = this.state;
    const { Title, Description, Level, steps } = untutorial;
    const { authUser } = this.props;
    const { key } = this.props.match.params;
    const stepCount =
      !!untutorial && !!untutorial.steps
        ? Object.keys(untutorial.steps).length
        : 0;

    if (Object.values(errors).length === 0) {
      untutorial.LastModified = Date.now();
      untutorial.Author = untutorial.Author.key;
      this.props.firebase
        .untutorial(key)
        .set({
          ...untutorial,
        })
        .then(() => {
          console.log("Successfully Saved");
          this.setState({ dirty: false });
        })
        .catch((error) => this.setState({ error: error.message }));
    }

    console.log("Save Changes");
  }
  saveProgressHandler(event) {
    const { untutorial, errors, progress } = this.state;

    const { authUser } = this.props;
    const { key } = this.props.match.params;

    if (Object.values(errors).length === 0) {
      //progress.Level = untutorial.Level;
      progress.LastModified = Date.now();
      this.props.firebase
        .progress(authUser.uid, untutorial.key)
        .set({
          ...progress,
        })
        .then(() => {
          console.log("Successfully Saved Progress");

          /*this.props.setGlobalState({
					messages:[{

						html:`SAVE.<span class="green">GOOD</span>`,
						type:true},{

						html:`Press any key to continue...`,
						type:false,

						}],
					showMessage:true
				});*/
        })
        .catch((error) => console.log(error));
    } else {
      var badFields = Object.keys(errors);
      var messages = [];
      for (var i = 0; i < badFields.length; i++) {
        messages.push({
          html: errors[badFields[i]],
          type: true,
        });
      }

      messages.push({
        html: `Press any key to continue...`,
        type: false,
      });

      this.props.setGlobalState({
        messages: messages,
        showMessage: true,
      });
    }

    console.log("Save Changes");
  }
  handleProgressURLOnChange(value) {
    const { progress } = this.state;
    var pCopy = progress;
    pCopy.URL = value;
    console.log(pCopy);
    this.setState({ progress: pCopy });
  }
  handleProgressURLOnSave(value) {
    this.saveProgressHandler();
  }
  studentApprove(step) {
    const { progress, untutorial } = this.state;
    var pCopy = progress;
    if (!progress.steps[step])
      progress.steps[step] = { Status: "PENDING", Comments: "" };
    progress.steps[step].Status = "PENDING";

    //progress.nextStep = untutorial.steps.findIndex((stepf,i)=>!progress.steps[i] || progress.steps[i].Status == 'DRAFT')+1;

    this.setState({ progress: progress }, this.saveProgressHandler);
  }
  chooseLang = (event) => {
    const { lang, authUser } = this.state;
    console.log(event.target.value);
    this.setState({ lang: event.target.value });
    console.log("AUTHUSER", !!authUser);
    if (this.props.authUser) {
      this.props.firebase
        .profile(this.props.authUser.uid + "/lang")
        .set(event.target.value);
    }
  };

  updateLang() {
    const { lang, authUser } = this.state;

    console.log("state", lang);
  }

  toggleVisibility() {
    const { languageSelect } = this.state;
    this.setState({ languageSelect: !languageSelect });
  }
  render() {
    const { untutorial, loading, author, progress, showiframe, error, lang } =
      this.state;
    const { Title, Description, Level, steps } = untutorial;
    const { authUser } = this.props;
    const { key } = this.props.match.params;

    var progressSteps = null;
    if (!!progress) progressSteps = progress.steps;
    var stepCount = 0;
    if (!!untutorial && !!untutorial.steps) stepCount = untutorial.steps.length;
    var nextStep = -1;
    if (!!progress) nextStep = progress.nextStep;
    if (nextStep > stepCount) nextStep = 0;

    //console.log(Object.keys(project));
    if (loading) return <div className="loading">Loading ...</div>;

    //can edit

    return (
      <section id="untutorial">
        {console.log("whatttt", lang)}
        <Helmet>
          <title>{`${
            !!authUser
              ? `${authUser.Username.replace(/\./g, " ").replace(
                  /\w\S*/g,
                  (w) => w.replace(/^\w/, (c) => c.toUpperCase())
                )} - ${untutorial.Title.replace(/<(.|\n)*?>/g, "").trim()}`
              : untutorial.Title.replace(/<(.|\n)*?>/g, "").trim()
          }`}</title>
        </Helmet>
        <div className="toggleLang">
          <a onClick={this.toggleVisibility}>
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
          <select value={lang} onChange={this.chooseLang}>
            <option value={lang}>{lang}</option>
            <option value={lang === "English" ? "Español" : "English"}>
              {lang === "English" ? "Español" : "English"}
            </option>
          </select>
          {/* <a onClick={() => this.setState({ lang: "en" })}>English</a>
            <a onClick={() => this.setState({ lang: "es" })}>Español</a> */}
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

                  <button onClick={this.loadProgress}>Code This Project</button>
                </div>
                <a className="back" onClick={() => this.props.history.goBack()}>
                  Back
                </a>
                <a
                  className="close"
                  onClick={() =>
                    this.setState({ showiframe: false, progress: null })
                  }
                >
                  <i className="fa fa-close"></i>
                </a>
              </>
            )}
            <div
              onClick={() => this.setState({ showiframe: !showiframe })}
              className="toggle-iframe"
            >
              <i className="fa fa-code"></i>
            </div>
          </div>
        </div>
        <div className={`thumbnail hero ${showiframe ? "blur" : ""}`}>
          {!!authUser &&
            (!!authUser.roles["ADMIN"] ||
              authUser.uid === untutorial.Author.key) && (
              <label htmlFor="files" className="upload">
                <input
                  id="files"
                  type="file"
                  onChange={this.handleThumbnailUpload}
                />
              </label>
            )}
          {this.state.uploading && (
            <progress value={this.state.uploadPercent} max="100" />
          )}
          {!!untutorial.ThumbnailFilename &&
            !!untutorial.ThumbnailFilename.length != 0 &&
            !this.state.uploading && (
              <LazyImage
                file={this.props.firebase.storage.ref(
                  "/public/" +
                    untutorial.Author.key +
                    "/" +
                    untutorial.ThumbnailFilename
                )}
              />
            )}
        </div>
        <div className="workOnProject">
          {!!progress && progress.Status == "APPROVED" && (
            <h3>
              GREAT JOB! You finished this project!{" "}
              <Link to={ROUTES.UNIVERSE + "/" + progress.untut}>
                Publish to the UNIVERSE!
              </Link>
            </h3>
          )}
          {!!progress && progress.Status == "PENDING" && (
            <h3>Your teacher is reviewing your project!</h3>
          )}
          {!!progress && progress.Status == "DRAFT" && nextStep > 0 && (
            <h3>Keep it Up! You're on Step {nextStep}!</h3>
          )}
          {error && <h3>{error}</h3>}
        </div>
        <div className={`main ${showiframe ? "blur" : ""}`}>
          <div className="main-content">
            <a className="back" onClick={() => this.props.history.goBack()}>
              <i className="fa fa-backward"></i>
            </a>

            {!!progress && (
              <TCSEditor
                disabled={false}
                type={"plain"}
                className="url"
                onEditorChange={this.handleProgressURLOnChange}
                onEditorSave={this.handleProgressURLOnSave}
                placeholder={"http://"}
                url={true}
                buttonText={progress.URL ? "Edit Link" : "Add Link"}
                text={progress.URL}
              />
            )}

            <div className="steps">
              {!!untutorial &&
                untutorial.steps.map((step, index) => (
                  <div
                    className={
                      "step " +
                      (!!progress && progress.steps[index].Status == "PENDING"
                        ? ""
                        : "")
                    }
                  >
                    <div className="checkOff">
                      <div className={"step-title status"}>
                        {/* {!!progress &&
                        !!progress.steps[index] &&
                        progress.steps[index].Status == "DRAFT" ? (
                          <div className="todo"></div>
                        ) : !!progress &&
                          !!progress.steps[index] &&
                          progress.steps[index].Status == "PENDING" ? (
                          <div className="pending"></div>
                        ) : (
                          !!progress && <div className="approved"></div>
                        )} */}
                        <p>
                          {lang === "Español"
                            ? `Paso ${index + 1}`
                            : `Step ${index + 1}`}
                          {!!step.Title && !!step.Title.length && <>:</>}
                        </p>

                        <TCSEditor
                          disabled={
                            !(
                              !!authUser &&
                              (!!authUser.roles["ADMIN"] ||
                                authUser.uid === untutorial.Author.key)
                            )
                          }
                          type={"plain"}
                          className="header"
                          onEditorChange={(value) =>
                            this.handleStepTitleOnChange(value, index)
                          }
                          onEditorSave={(value) =>
                            this.handleStepTitleOnSave(value, index)
                          }
                          placeholder={"Step Title"}
                          buttonText={!!progress ? "" : "Edit Title"}
                          text={
                            lang === "Español" &&
                            untutorial.steps[index].TitleEs
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
                            !!authUser &&
                            (!!authUser.roles["ADMIN"] ||
                              authUser.uid === untutorial.Author.key)
                          )
                        }
                        type={"text"}
                        className={!!progress ? "no-button" : "editor"}
                        onEditorChange={(value) =>
                          this.handleStepOnChange(value, index)
                        }
                        onEditorSave={(value) =>
                          this.handleStepOnSave(value, index)
                        }
                        placeholder={"Step Description"}
                        buttonText={!!progress ? "" : "Edit Description"}
                        text={
                          lang === "Español" &&
                          untutorial.steps[index].DescriptionEs
                            ? untutorial.steps[index].DescriptionEs
                            : untutorial.steps[index].Description
                        }
                      />
                      {!!progress &&
                        !!progress.steps[index] &&
                        progress.steps[index].Comments != "" && (
                          <div className={"comments"}>
                            <h4>Teacher comments:</h4>{" "}
                            {progress.steps[index].Comments}
                          </div>
                        )}
                      <div
                        className={
                          !!untutorial.steps[index].ThumbnailFilename
                            ? "thumbnail crop"
                            : "thumbnail"
                        }
                      >
                        {!!authUser &&
                          (!!authUser.roles["ADMIN"] ||
                            authUser.uid === untutorial.Author.key) && (
                            <>
                              <p
                                className={
                                  !!untutorial.steps[index].ThumbnailFilename
                                    ? "change"
                                    : "add"
                                }
                              >
                                {!!untutorial.steps[index].ThumbnailFilename
                                  ? "Update Screenshot"
                                  : "+ Add Screenshot"}
                              </p>
                              <label
                                htmlFor={"step" + index + "-thumbnail-upload"}
                                className={
                                  !!untutorial.steps[index].ThumbnailFilename
                                    ? "upload replace"
                                    : "upload"
                                }
                              >
                                <input
                                  id={"step" + index + "-thumbnail-upload"}
                                  type="file"
                                  onChange={(event) =>
                                    this.handleStepThumbnailUpload(event, index)
                                  }
                                />
                              </label>
                            </>
                          )}

                        {this.state.uploading && (
                          <progress
                            value={this.state.uploadPercent}
                            max="100"
                          />
                        )}

                        {!!untutorial.steps[index].ThumbnailFilename &&
                          !!untutorial.steps[index].ThumbnailFilename.length !=
                            0 &&
                          !this.state.uploading &&
                          (lang === "English" ||
                            !!!untutorial.steps[index].ThumbnailFilenameSp) && (
                            <LazyImage
                              id={"step" + index + "-thumbnail"}
                              className="crop"
                              file={this.props.firebase.storage.ref(
                                "/public/" +
                                  untutorial.Author.key +
                                  "/" +
                                  untutorial.steps[index].ThumbnailFilename
                              )}
                            />
                          )}

                        {!!authUser &&
                          (!!authUser.roles["ADMIN"] ||
                            authUser.uid === untutorial.Author.key) &&
                          lang === "Español" && (
                            <>
                              <p
                                className={
                                  !!untutorial.steps[index].ThumbnailFilename
                                    ? "change"
                                    : "add"
                                }
                              >
                                {!!untutorial.steps[index].ThumbnailFilename
                                  ? "Update Screenshot"
                                  : "+ Add Screenshot"}
                              </p>
                              <label
                                htmlFor={"step" + index + "-thumbnail-upload"}
                                className={
                                  !!untutorial.steps[index].ThumbnailFilename
                                    ? "upload replace"
                                    : "upload"
                                }
                              >
                                <input
                                  id={"step" + index + "-thumbnail-upload"}
                                  type="file"
                                  onChange={(event) =>
                                    this.handleStepThumbnailUpload(event, index)
                                  }
                                />
                              </label>
                            </>
                          )}

                        {!!untutorial.steps[index].ThumbnailFilenameSp &&
                          !!untutorial.steps[index].ThumbnailFilenameSp
                            .length != 0 &&
                          !this.state.uploading &&
                          lang === "Español" && (
                            <LazyImage
                              id={"step" + index + "-thumbnail"}
                              className="crop"
                              file={this.props.firebase.storage.ref(
                                "/public/" +
                                  untutorial.Author.key +
                                  "/" +
                                  untutorial.steps[index].ThumbnailFilenameSp
                              )}
                            />
                          )}
                      </div>

                      {!!progress &&
                        (!progress.steps[index] ||
                          progress.steps[index].Status == "DRAFT") && (
                          <button
                            disabled={false}
                            className={"done-button todo"}
                            onClick={() => this.studentApprove(index)}
                          >
                            Mark Done
                          </button>
                        )}
                      {!!progress &&
                        (!progress.steps[index] ||
                          progress.steps[index].Status == "PENDING") && (
                          <div className="done-button pending">In Review</div>
                        )}
                      {!!progress &&
                        (!progress.steps[index] ||
                          progress.steps[index].Status == "APPROVED") && (
                          <div className="done-button approved">Approved</div>
                        )}
                    </div>
                    {stepCount > 1 &&
                      !!authUser &&
                      (!!authUser.roles["ADMIN"] ||
                        authUser.uid === untutorial.Author.key) && (
                        <button
                          className="del"
                          onClick={(event) =>
                            this.deleteStepHandler(event, index)
                          }
                          text="Delete Step"
                        >
                          Delete Step
                        </button>
                      )}
                  </div>
                ))}
              {!!authUser &&
                (!!authUser.roles["ADMIN"] ||
                  authUser.uid === untutorial.Author.key) && (
                  <div className="addDelete">
                    <button
                      onClick={(event) => this.addStepHandler(event)}
                      text="Add Step"
                    >
                      Add Step
                    </button>
                    <button onClick={this.deleteProjectHandler}>
                      Delete Untutorial
                    </button>
                  </div>
                )}
            </div>
          </div>
          <div className="sidebar">
            <>
              {!!untutorial.Categories["SCRATCH"] && (
                <a
                  className="scratch"
                  href="https://scratch.mit.edu"
                  target="_Blank"
                >
                  <LazyImage
                    file={this.props.firebase.storage.ref(
                      "/public/scratch.png"
                    )}
                  />
                </a>
              )}
              {!!untutorial.Categories["WOOF"] && (
                <a
                  className="scratch"
                  href="https://woofjs.com"
                  target="_Blank"
                >
                  <LazyImage
                    file={this.props.firebase.storage.ref("/public/woof.png")}
                  />
                </a>
              )}
              {!!untutorial.Categories["WEB"] && (
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
                      !!authUser &&
                      (!!authUser.roles["ADMIN"] ||
                        authUser.uid === untutorial.Author.key)
                    )
                  }
                  type={"text"}
                  className={"title"}
                  name={"title"}
                  onEditorChange={this.handleTitleOnChange}
                  onEditorSave={this.handleTitleOnSave}
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
                    (!!authUser.roles["ADMIN"] ||
                      authUser.uid === untutorial.Author.key)
                  )
                }
                type={"select"}
                className="level"
                selectOptions={["1", "2", "3", "4", "5", "6"]}
                onEditorChange={this.handleLevelOnChange}
                onEditorSave={this.handleLevelOnSave}
                placeholder={"Level"}
                text={untutorial.Level}
              />
            </div>
            {authUser && !!authUser.roles["ADMIN"] && (
              <div className="container">
                Priority:
                <TCSEditor
                  disabled={false}
                  type={"select"}
                  className="priority"
                  selectOptions={["1", "2", "3", "4", "5", "6"]}
                  onEditorChange={this.handlePriorityOnChange}
                  onEditorSave={this.handlePriorityOnSave}
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
                    (!!authUser.roles["ADMIN"] ||
                      authUser.uid === untutorial.Author.key)
                  )
                }
                type={"text"}
                onEditorChange={this.handleDescriptionOnChange}
                onEditorSave={this.handleDescriptionOnSave}
                placeholder={"Untutorial Description"}
                name={"description"}
                text={
                  lang === "Español" && untutorial.DescriptionEs
                    ? untutorial.DescriptionEs
                    : untutorial.Description
                }
              />
            </div>
            {!!authUser &&
              (!!authUser.roles["ADMIN"] ||
                authUser.uid === untutorial.Author.key) && (
                <div className="container">
                  <h4>Status</h4>
                  <TCSEditor
                    disabled={!(authUser && !!authUser.roles["ADMIN"])}
                    type={"select"}
                    selectOptions={["DRAFT", "APPROVED"]}
                    name={"status"}
                    className={
                      untutorial.Status === "APPROVED" ? "approved" : "draft"
                    }
                    onEditorChange={this.handleStatusOnChange}
                    onEditorSave={this.handleStatusOnSave}
                    placeholder={"Status"}
                    text={untutorial.Status}
                  />
                </div>
              )}
            {!!authUser &&
              (!!authUser.roles["ADMIN"] ||
                authUser.uid === untutorial.Author.key) && (
                <div className="container">
                  <h4>Category</h4>

                  <div className="filter">
                    {Object.keys(untutorial.Categories).length !=
                      Object.keys(FILTERS).length && (
                      <select onChange={this.handlePCategoryOnChange}>
                        <option value="-1">-------</option>
                        {Object.keys(FILTERS)
                          .filter(
                            (f) =>
                              !Object.keys(untutorial.Categories).includes(f)
                          )
                          .map((catName) => (
                            <option value={catName}>{FILTERS[catName]}</option>
                          ))}
                      </select>
                    )}

                    <div className="filter-categories">
                      {Object.keys(untutorial.Categories).map((f) => (
                        <a onClick={() => this.handleCategoryOnClick(f)}>
                          {FILTERS[f]}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* {!!authUser &&
              (!!authUser.roles["ADMIN"] ||
                authUser.uid === untutorial.Author.key) && (
                <div className="container">
                  <h4>Skills</h4>

                  <div className="filter">
                    {untutorial.Skills &&
                      Object.keys(untutorial.Skills).length !=
                        Object.keys(SKILLS).length && (
                        <select onChange={this.handleSkillsOnChange}>
                          <option value="-1">-------</option>
                          {Object.keys(SKILLS)
                            .filter(
                              (f) => !Object.keys(untutorial.Skills).includes(f)
                            )
                            .map((catName) => (
                              <option value={catName}>{SKILLS[catName]}</option>
                            ))}
                        </select>
                      )}
                    {untutorial.Skills && (
                      <div className="filter-categories">
                        {Object.keys(untutorial.Skills).map((f) => (
                          <a onClick={() => this.handleSkillsOnClick(f)}>
                            {SKILLS[f]}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )} */}
          </div>
        </div>
      </section>
    );
  }
}

const ProjectPage = withFirebase(withAuthentication(UntutorialPageBase));

export default ProjectPage;
