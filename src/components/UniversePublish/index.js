import React from "react";
import LazyImage from "../LazyImage";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import TCSEditor from "../TCSEditor";
import { v4 as uuidv4 } from "uuid";
import * as ROUTES from "../../constants/routes";
import * as CATEGORIES from "../../constants/categories";
import "./universe-publish.scss";

class UniversePublish extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      loading: true,
      uploading: false,
      uploadPercent: 0,
      errors: {
        Title: "",
        Description: "",
        Thumbnail: "",
        Categories: "",
        URL: "",
      },
      project: {
        key: uuidv4(),
        Author: null,
        untut: null,
        Categories: {},
        Description: "",
        Level: 1,
        ThumbnailFilename: null,
        Title: "",
        Status: "APPROVED",
        URL: "",
      },
    };

    this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);
    this.handleThumbnailValidate = this.handleThumbnailValidate.bind(this);
    this.handlePTitleOnChange = this.handlePTitleOnChange.bind(this);
    this.handlePTitleOnSave = this.handlePTitleOnSave.bind(this);
    this.handlePTitleValidate = this.handlePTitleValidate.bind(this);
    this.handlePDescriptionOnSave = this.handlePDescriptionOnSave.bind(this);
    this.handlePDescriptionOnChange =
      this.handlePDescriptionOnChange.bind(this);
    this.handlePDescriptionValidate =
      this.handlePDescriptionValidate.bind(this);
    this.handlePURLOnChange = this.handlePURLOnChange.bind(this);
    this.handlePURLOnSave = this.handlePURLOnSave.bind(this);
    this.handlePURLValidate = this.handlePURLValidate.bind(this);
    this.handlePCategoryOnChange = this.handlePCategoryOnChange.bind(this);
    this.handleCategoryValidate = this.handleCategoryValidate.bind(this);
    this.handleCategoryOnClick = this.handleCategoryOnClick.bind(this);
    this.saveChangesHandler = this.saveChangesHandler.bind(this);

    //this.onChange = editorState => this.setState({editorState});
    //console.log("hiya");
  }

  handleMouseEnter = (target) => {
    if (this.state.canEdit) {
      return; //replace control with rich text editor
    }
  };

  componentDidMount() {
    const { authUser } = this.props;
    const { key } = this.props.match.params;
    const { project, projectRef, errors } = this.state;
    console.log("errors ", Object.values(errors).length === 0);

    this.props.firebase.untutorial(key).on("value", (snapshot) => {
      let untutorial = snapshot.val();

      project.untut = key;
      project.Level = untutorial.Level;

      this.setState({ project: project, loading: false });
    });
  }
  componentWillReceiveProps(props) {
    const { authUser } = props;
    const { project } = this.state;
    if (!project.Author) {
      project.Author = authUser.uid;
      this.setState({
        project: project,
      });
    }
  }

  componentWillUnmount() {
    this.props.firebase.untutorial().off();
  }
  handlePTitleOnSave(value) {
    // const { errors } = this.state;
    // var pCopy = this.state.project;
    // if (value !== pCopy.Title) {
    //   pCopy.Title = value;
    //   this.setState({ project: pCopy }, this.handlePTitleValidate);
    // }
  }
  handlePTitleOnChange(value) {
    var pCopy = this.state.project;
    if (value !== pCopy.Title) {
      pCopy.Title = value;
      this.setState({ project: pCopy }, this.handlePTitleValidate);
    }
  }
  handlePTitleValidate() {
    const { project, errors } = this.state;
    const { Title } = project;
    const text = Title.replace(/<(.|\n)*?>/g, "").trim();

    if (text.length == 0) {
      errors["Title"] = "Title is required.";
    }
    // if (text.length < 5) {
    //   errors["Title"] = 'TITLE.<span class="red">ISTOOSHORT</span>';
    // }
    else {
      delete errors["Title"];
    }
    this.setState({ errors: errors });
  }
  handleThumbnailUpload(event) {
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var pCopy = this.state.project;
    var { authUser } = this.props;
    pCopy.ThumbnailFilename = uuidv4() + "." + ext;

    var storageRef = this.props.firebase.storage.ref(
      "/public/" + authUser.uid + "/" + pCopy.ThumbnailFilename
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
        console.log(error);
        this.setState({ uploadPercent: 0, uploading: false });
      },
      () => {
        //complete
        this.setState(
          { uploadPercent: 0, uploading: false, project: pCopy },
          this.handleThumbnailValidate
        );
      }
    );
  }
  handleThumbnailValidate() {
    const { project, errors } = this.state;
    const { ThumbnailFilename } = project;
    const text = ThumbnailFilename.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["Thumbnail"] = "Image required";
    } else {
      delete errors["Thumbnail"];
    }
    this.setState({ errors: errors });
  }
  handlePDescriptionOnSave() {}
  handlePDescriptionOnChange(value) {
    var pCopy = this.state.project;
    if (value !== pCopy.Description) {
      pCopy.Description = value;
      this.setState({ project: pCopy }, this.handlePDescriptionValidate);
    }
  }
  handlePDescriptionValidate() {
    const { project, errors } = this.state;
    const { Description } = project;
    const text = Description.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["Description"] = "Description required";
    }
    // else if (text.length < 20) {
    //   errors["Description"] = 'DESCRIPTION.<span class="red">ISTOOSHORT</span>';
    // }
    else {
      delete errors["Description"];
    }
    this.setState({ errors: errors });
  }
  handlePURLOnSave() {}
  handlePURLOnChange(value) {
    var pCopy = this.state.project;
    if (value !== pCopy.URL) {
      pCopy.URL = value;
      this.setState({ project: pCopy }, this.handlePURLValidate);
    }
  }
  handlePURLValidate() {
    const { project, errors } = this.state;
    const { URL } = project;
    const text = URL.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["URL"] = "URL required";
    } else if (
      text.match(
        /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
      ) == null
    ) {
      errors["URL"] = "There is a problem with this url";
    } else {
      delete errors["URL"];
    }
    this.setState({ errors: errors });
  }
  handlePCategoryOnChange(event) {
    const { project } = this.state;
    project.Categories[event.target.value] = event.target.value;
    this.setState({ project: project }, this.handleCategoryValidate);
  }
  handleCategoryOnClick(text) {
    const { project } = this.state;
    delete project.Categories[text];
    this.setState({ project: project }, this.handleCategoryValidate);
  }
  handleCategoryValidate() {
    const { project, errors } = this.state;
    if (Object.keys(project.Categories).length < 1) {
      errors["Categories"] = "At least 1 category required";
    } else delete errors["Categories"];
    this.setState({ errors: errors });
  }

  saveChangesHandler(event) {
    const { project, loading, errors } = this.state;
    const { Title, Description, URL, Author, untut, Level } = project;
    const { authUser } = this.props;
    const { key } = this.props.match.params;
    try {
      if (Object.keys(errors).length == 0) {
        project.LastModified = Date.now();
        project.Author = authUser.uid;
        this.props.firebase
          .project(project.key)
          .set({
            ...project,
          })
          .then(() => {
            console.log("Successfully Saved");
            window.location = ROUTES.UNIVERSE;
          })
          .catch((error) => console.log(error));
      } else {
        throw new Error("Missing fields");
      }
    } catch (err) {
      if (errors["Title"] == "") errors["Title"] = "Missing Title";
      if (errors["Thumbnail"] == "") errors["Thumbnail"] = "Missing Image";
      if (errors["Description"] == "")
        errors["Description"] = "Missing Description";
      if (errors["URL"] == "") errors["URL"] = "Missing URL";
      if (errors["Categories"] == "")
        errors["Categories"] = "Missing Categories";
    } finally {
      this.setState({ errors: errors });
    }

    console.log("Save Changes");
  }

  render() {
    const { project, loading, errors } = this.state;
    const { Title, Description, Level, Categories } = project;
    const { authUser } = this.props;

    //console.log(Object.keys(project));
    if (loading) return <div className="loading">Loading ...</div>;

    return (
      <section id="universe-publish">
        <div className="main">
          <h1>Publish Project</h1>

          <h2 class="center">
            Categories<span className="required">*</span>
          </h2>
          <div className="filter">
            {Object.keys(project.Categories).length !=
              Object.keys(CATEGORIES).length && (
              <select onChange={this.handlePCategoryOnChange}>
                {Object.keys(CATEGORIES)
                  .filter((f) => !Object.keys(project.Categories).includes(f))
                  .map((catName) => (
                    <option value={catName}>{catName}</option>
                  ))}
              </select>
            )}
          </div>

          {Object.keys(project.Categories).length > 0 && (
            <div className="filter-categories">
              {Object.keys(project.Categories).map((f) => (
                <a onClick={() => this.handleCategoryOnClick(f)}>{f}</a>
              ))}
            </div>
          )}

          <div className="main-area">
            <div className="thumbnail">
              <h4>
                Image<span className="required">*</span>
              </h4>
              <button>Add Image</button>

              {this.state.uploading && (
                <progress value={this.state.uploadPercent} max="100" />
              )}
              {!!project.ThumbnailFilename &&
                project.ThumbnailFilename !== "" &&
                !this.state.uploading && (
                  <LazyImage
                    file={this.props.firebase.storage.ref(
                      "/public/" +
                        project.Author +
                        "/" +
                        project.ThumbnailFilename
                    )}
                  />
                )}
              <label className="upload" for="files">
                <input
                  id="files"
                  type="file"
                  onChange={this.handleThumbnailUpload}
                />
              </label>
            </div>
            <h4>
              Title<span class="required">*</span>
            </h4>

            <TCSEditor
              disabled={false}
              type="plain"
              buttonText={project.Title.length > 0 ? "Edit Title" : "Add Title"}
              onEditorChange={this.handlePTitleOnChange}
              onEditorSave={this.handlePTitleOnSave}
              placeholder={"Project Title"}
              text={project.Title}
            />
            <h4>
              Description<span className="required">*</span>
            </h4>
            <TCSEditor
              disabled={false}
              type="text"
              buttonText={project.Description ? "Edit" : "Add"}
              onEditorChange={this.handlePDescriptionOnChange}
              onEditorSave={this.handlePDescriptionOnSave}
              placeholder={"Project Description"}
              text={project.Description}
            />
            <h4>
              Project URL<span className="required">*</span>
            </h4>
            <TCSEditor
              disabled={false}
              type="plain"
              buttonText={project.Description ? "Edit" : "Add"}
              onEditorChange={this.handlePURLOnChange}
              onEditorSave={this.handlePURLOnSave}
              placeholder={"Project URL"}
              text={project.URL}
            />
          </div>
        </div>
        <div className="main-content">
          <button disabled={false} onClick={this.saveChangesHandler}>
            Publish
          </button>
          {Object.keys(errors).map((error) => (
            <p class="errors">{errors[error]}</p>
          ))}
        </div>
      </section>
    );
  }
}

export default withFirebase(withAuthentication(UniversePublish));
