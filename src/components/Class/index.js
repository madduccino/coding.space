import React from "react";
import LazyImage from "../LazyImage";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import TCSEditor from "../TCSEditor";
import ListBox from "react-listbox";
import "react-listbox/dist/react-listbox.css";
import * as ROLES from "../../constants/roles";
import * as ROUTES from "../../constants/routes";
import { v4 as uuidv4 } from "uuid";
import "./class.scss";

class ClassPageBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      loading: true,
      errors: {},
      clazz: {},
      profiles: null,
      selectedMembers: {},
      uploading: false,
      uploadPercent: 0,
      dirty: false,
      editClass: false,
      profileUrl: null,
    };
    this.handleClassTitleOnChange = this.handleClassTitleOnChange.bind(this);
    this.handleClassTitleValidate = this.handleClassTitleValidate.bind(this);
    this.handleClassTitleOnSave = this.handleClassTitleOnSave.bind(this);
    this.handleClassDescriptionOnChange =
      this.handleClassDescriptionOnChange.bind(this);
    this.handleClassDescriptionValidate =
      this.handleClassDescriptionValidate.bind(this);
    this.handleClassDescriptionOnSave =
      this.handleClassDescriptionOnSave.bind(this);
    this.handleClassScheduleOnChange =
      this.handleClassScheduleOnChange.bind(this);
    this.handleClassScheduleValidate =
      this.handleClassScheduleValidate.bind(this);
    this.handleClassScheduleOnSave = this.handleClassScheduleOnSave.bind(this);
    this.handleClassLocationOnChange =
      this.handleClassLocationOnChange.bind(this);
    this.handleClassLocationValidate =
      this.handleClassLocationValidate.bind(this);
    this.handleClassLocationOnSave = this.handleClassLocationOnSave.bind(this);
    this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
    this.handleStatusValidate = this.handleStatusValidate.bind(this);
    this.handleStatusOnSave = this.handleStatusOnSave.bind(this);
    this.handleMembersOnChange = this.handleMembersOnChange.bind(this);
    this.handleMembersValidate = this.handleMembersValidate.bind(this);
    this.handleMembersOnSave = this.handleMembersOnSave.bind(this);
    this.deleteClassHandler = this.deleteClassHandler.bind(this);
    this.saveChangesHandler = this.saveChangesHandler.bind(this);
    this.handleThumbnailUpload = this.handleThumbnailUpload.bind(this);

    //this.onChange = editorState => this.setState({editorState});
    //console.log("hiya");
  }

  handleMouseEnter = (target) => {
    if (this.state.canEdit) {
      return; //replace control with rich text editor
    }
  };

  componentDidMount() {
    console.log(this.props);
    // const {authUser} = this.props;

    const { key } = this.props.match.params;
    console.log(key);
    // this.props.firebase.profile(authUser.key).child('ThumbnailFilename').on('value',snapshot=>{
    // 	var url = snapshot.val();
    // 	console.log(url)
    //     this.setState({profileUrl:url});
    //   })
    this.props.firebase.class(key).on("value", (snapshot) => {
      const clazz = snapshot.val();
      this.props.firebase
        .profiles()
        .once("value")
        .then((snapshot2) => {
          const prof = snapshot2.val();
          this.setState({
            clazz: clazz,
            profiles: prof,
            loading: false,
          });
        });
    });
  }

  componentWillUnmount() {
    this.props.firebase.class().off();
  }
  handleClassTitleOnChange(value) {
    var cCopy = this.state.clazz;
    if (value !== cCopy.Title) {
      cCopy.Title = value;

      this.setState(
        { clazz: cCopy, dirty: true },
        this.handleClassTitleValidate
      );
    }
  }
  handleClassTitleValidate() {
    const { clazz, errors } = this.state;
    if (clazz.Title.length === 0) {
      errors["Title"] = 'TITLE.<span class="red">ISREQUIRED</span>';
    } else if (clazz.Title.length <= 5) {
      errors["Title"] = 'TITLE.<span class="red">ISTOOSHORT</span>';
    } else delete errors["Title"];
    this.setState({ errors: errors });
  }
  handleClassTitleOnSave() {
    this.saveChangesHandler();
  }
  handleClassDescriptionOnChange(value) {
    var cCopy = this.state.clazz;
    if (value !== cCopy.Description) {
      cCopy.Description = value;

      this.setState(
        { clazz: cCopy, dirty: true },
        this.handleClassDescriptionValidate
      );
    }
  }
  handleClassDescriptionValidate() {
    const { clazz, errors } = this.state;
    const text = clazz.Description.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["Description"] = 'DESCRIPTION.<span class="red">ISREQUIRED</span>';
    } else if (text.length <= 5) {
      errors["Description"] = 'DESCRIPTION.<span class="red">ISTOOSHORT</span>';
    } else delete errors["Description"];
    this.setState({ errors: errors });
  }
  handleClassDescriptionOnSave() {
    this.saveChangesHandler();
  }
  handleClassScheduleOnChange(value) {
    var cCopy = this.state.clazz;
    if (value !== cCopy.Schedule) {
      cCopy.Schedule = value;

      this.setState(
        { clazz: cCopy, dirty: true },
        this.handleClassScheduleValidate
      );
    }
  }
  handleClassScheduleValidate() {
    const { clazz, errors } = this.state;
    const text = clazz.Schedule.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["Schedule"] = 'SCHEDULE.<span class="red">ISREQUIRED</span>';
    } else if (text.length <= 5) {
      errors["Schedule"] = 'SCHEDULE.<span class="red">ISTOOSHORT</span>';
    } else delete errors["Schedule"];
    this.setState({ errors: errors });
  }
  handleClassScheduleOnSave() {
    this.saveChangesHandler();
  }
  handleClassLocationOnChange(value) {
    var cCopy = this.state.clazz;
    if (value !== cCopy.Location) {
      cCopy.Location = value;

      this.setState(
        { clazz: cCopy, dirty: true },
        this.handleClassLocationValidate
      );
    }
  }
  handleClassLocationValidate() {
    const { clazz, errors } = this.state;
    const text = clazz.Location.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["Location"] = 'LOCATION.<span class="red">ISREQUIRED</span>';
    } else if (text.length <= 5) {
      errors["Location"] = 'LOCATION.<span class="red">ISTOOSHORT</span>';
    } else delete errors["Location"];
    this.setState({ errors: errors });
  }
  handleClassLocationOnSave() {
    this.saveChangesHandler();
  }
  handleStatusOnChange(value) {
    var cCopy = this.state.clazz;
    if (value !== cCopy.Status) {
      cCopy.Status = value;
      this.setState(
        { clazz: cCopy, dirty: true } /*,this.handleStatusValidate*/
      );
    }
  }
  handleStatusValidate() {
    const { clazz, errors } = this.state;
    const text = clazz.Status.replace(/<(.|\n)*?>/g, "").trim();
    if (text.length === 0) {
      errors["Location"] = 'LOCATION.<span class="red">ISREQUIRED</span>';
    } else if (text.length <= 10) {
      errors["Location"] = 'LOCATION.<span class="red">ISTOOSHORT</span>';
    } else delete errors["Location"];
    this.setState({ errors: errors });
  }
  handleStatusOnSave() {
    this.saveChangesHandler();
  }
  handleMembersOnChange(selectedMembers) {
    var cCopy = this.state.clazz;
    cCopy.Members = {};
    for (var i = 0; i < selectedMembers.length; i++) {
      cCopy.Members[selectedMembers[i]] = selectedMembers[i];
    }

    this.setState({ clazz: cCopy, dirty: true }, () => {
      this.handleMembersValidate();
      this.saveChangesHandler();
    });
  }
  handleMembersValidate() {
    const { clazz, errors } = this.state;

    if (Object.keys(clazz.Members).length === 0) {
      errors["Members"] = 'CLASS.<span class="red">NEEDSASTUDENT</span>';
    } else delete errors["Members"];
    this.setState({ errors: errors });
  }
  handleMembersOnSave() {
    this.saveChangesHandler();
  }
  deleteClassHandler(value) {
    const { key } = this.props.match.params;

    this.props.firebase.class(key).remove();
    window.location = ROUTES.CLASSES;
  }
  handleThumbnailUpload(event) {
    var file = event.target.files[0];
    var ext = file.name.substring(file.name.lastIndexOf(".") + 1);
    var cCopy = this.state.clazz;

    cCopy.ThumbnailFilename = uuidv4() + "." + ext;

    var storageRef = this.props.firebase.storage.ref(
      "/classes/" + cCopy.ThumbnailFilename
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
        this.setState({
          uploadPercent: 0,
          uploading: false,
          clazz: cCopy,
          dirty: true,
        });
      }
    );
  }

  saveChangesHandler(event) {
    const { key } = this.props.match.params;
    const { clazz, errors } = this.state;
    if (Object.keys(errors).length === 0) {
      clazz.LastModified = Date.now();
      this.props.firebase
        .class(key)
        .set({
          ...clazz,
        })
        .then(() => {
          console.log("Successfully Saved");
          this.setState({ dirty: false });
        })
        .catch((error) => console.log(error));
    } else {
      var badFields = Object.keys(errors);
      var messages = [];
      messages.push({
        html: `<span class="green">Saving</span>...`,
        type: true,
      });
      messages.push({
        html: `<span class="red">ERROR!</span>`,
        type: false,
      });
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

  render() {
    const { clazz, loading, uploading, uploadPercent, profiles, editClass } =
      this.state;
    const { authUser } = this.props;

    if (loading) return <div className="loading">Loading ...</div>;
    // const isInvalid =
    //   clazz.Title === "" ||
    //   clazz.Description === "" ||
    //   clazz.Schedule === "" ||
    //   clazz.Location === "" ||
    //   Object.keys(clazz.Members).length <= 0 ||
    //   loading;

    //can edit

    //assemble listbox data
    const listBoxOptions = [];
    const listBoxSelected = [];
    if (!!profiles) {
      Object.keys(profiles).map((profile) => {
        listBoxOptions.push({
          label: !!profiles[profile].roles[ROLES.TEACHER]
            ? profiles[profile].Username.replace(".", " ") + "(TEACHER)"
            : profiles[profile].Username.replace(".", " "),
          value: profiles[profile].key,
        });
        if (!!clazz.Members[profiles[profile].key])
          listBoxSelected.push(profile);
      });
    }

    return (
      <section id="clazz">
        {/* <div className="sidebar"> */}

        {/* <div className="avatar">
              {!!clazz.ThumbnailFilename && !uploading ? (
                <LazyImage
                  file={this.props.firebase.storage.ref(
                    "/classes/" + clazz.ThumbnailFilename
                  )}
                />
              ) : (
                <LazyImage
                  className="defaultImage"
                  file={this.props.firebase.storage.ref("/public/rocket.png")}
                />
              )}
              <label for="files" className="upload">
                <input
                  id="files"
                  type="file"
                  onChange={this.handleThumbnailUpload}
                />
              </label>
              {uploading && <progress value={uploadPercent} max="100" />}
            </div>

            <div>
              <h4>Description</h4>

              <TCSEditor
                disable={!(!!authUser && !!authUser.roles["ADMIN"])}
                type="text"
                onEditorChange={this.handleClassDescriptionOnChange}
                onEditorSave={this.handleClassDescriptionOnSave}
                placeholder={"Class Description"}
                text={clazz.Description}
              />
            </div>

            <div>
              <h4>Schedule</h4>
              <TCSEditor
                disabled={!(!!authUser && !!authUser.roles["ADMIN"])}
                type="text"
                onEditorChange={(value) =>
                  this.handleClassScheduleOnChange(value)
                }
                onEditorSave={this.handleClassScheduleOnSave}
                placeholder={"Schedule Description"}
                text={clazz.Schedule}
              />
            </div>
            <div>
              <h4>Location</h4>
              <TCSEditor
                disabled={!(!!authUser && !!authUser.roles["ADMIN"])}
                type="text"
                onEditorChange={(value) =>
                  this.handleClassLocationOnChange(value)
                }
                onEditorSave={this.handleClassLocationOnSave}
                placeholder={"Location Description"}
                text={clazz.Location}
              />
            </div> */}
        {/* </div> */}
        <div className="main-content">
          <div className="approve">
            <TCSEditor
              disabled={!(!!authUser && !!authUser.roles["ADMIN"])}
              type="select"
              selectOptions={["DRAFT", "APPROVED"]}
              onEditorChange={this.handleStatusOnChange}
              onEditorSave={this.handleStatusOnSave}
              placeholder={"Class Status"}
              text={clazz.Status}
            />
          </div>
          <TCSEditor
            disabled={!(!!authUser && !!authUser.roles["ADMIN"])}
            type="plain"
            onEditorChange={this.handleClassTitleOnChange}
            onEditorSave={this.handleClassTitleOnSave}
            placeholder={"Class Title"}
            text={clazz.Title}
          />
          <h1>Class Members</h1>
          <div className="grid-container">
            <div className="header">Names</div>
          </div>

          {!!profiles &&
            listBoxSelected.map((profile) => (
              <div className="grid-container">
                {profiles[profile].roles["STUDENT"] && (
                  <div className="content">
                    <a href={`../profile/${profile}`}>
                      {/* <LazyImage
                        id={"profile-thumbnail"}
                        file={
                          profiles[profile].ThumbnailFilename &&
                          profiles[profile].ThumbnailFilename !== ""
                            ? this.props.firebase.storage.ref(
                                "/public/" +
                                  profile +
                                  "/" +
                                  profiles[profile].ThumbnailFilename
                              )
                            : this.props.firebase.storage.ref(
                                "/public/logo.png"
                              )
                        }
                      /> */}
                      <span>
                        {profiles[profile].Username.replace(/\./g, " ")}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            ))}

          {!!authUser &&
            (!!authUser.roles["ADMIN"] || !!authUser.roles["TEACHER"]) &&
            !!profiles && (
              <div className="console">
                <div className={editClass ? "showConsole" : "hideConsole"}>
                  <ListBox
                    options={listBoxOptions}
                    onChange={this.handleMembersOnChange}
                    selected={listBoxSelected}
                  />
                </div>
                <div class="buttons">
                  <button
                    onClick={() => this.setState({ editClass: !editClass })}
                  >
                    {editClass ? "Save" : "Edit Class"}
                  </button>
                  {!!authUser.roles["ADMIN"] && (
                    <button onClick={this.deleteClassHandler}>
                      Delete Class
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </section>
    );
  }
}

const condition = (authUser) =>
  authUser &&
  (!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]);
const ClazzPage = withFirebase(withAuthentication(ClassPageBase));

export default ClazzPage;
