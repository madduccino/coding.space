import React from "react";
import ReactQuill from "react-quill";
import "./quill.snow.scss";
import { htmlEditButton } from "quill-html-edit-button";
ReactQuill.Quill.register("modules/htmlEditButton", htmlEditButton);

class TCSEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      type: props.type,
      selectOptions: props.selectOptions,
      disabled: props.disabled,
      placeholder: props.placeholder,
      name: props.name,
      editing: false,
      buttonText: !!props.buttonText ? props.buttonText : "Edit",

      save: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  handleChange = (value) => {
    this.setState({ text: value });
    this.props.onEditorChange(value);
  };
  handleSelectChange = (event) => {
    this.setState({ text: event.target.value });
    this.props.onEditorChange(event.target.value);
  };
  handleTextChange = (event) => {
    this.setState({ text: event.target.value });
    this.props.onEditorChange(event.target.value);
  };
  componentWillReceiveProps(props) {
    //if(this.state.text != props.text)
    this.setState({ ...this.props, ...props });
  }
  handleEdit() {
    const { editing } = this.state;
    this.setState({ editing: !editing });
  }
  handleSave() {
    const { editing, text } = this.state;
    this.setState({ editing: !editing });
    this.props.onEditorSave(text);
  }

  render() {
    const { className } = this.props;

    const {
      text,
      type,
      selectOptions,
      disabled,
      placeholder,
      name,
      editing,
      save,
      buttonText,
    } = this.state;

    if (!!disabled) {
      return (
        <div className={"field " + className}>
          <div name={name} dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      );
    } else if (!disabled && !editing) {
      if (this.props.url) {
        return (
          <div className={"field " + className}>
            {text ? (
              <a target="_blank" href={text}>
                Go to Project
              </a>
            ) : (
              <>
                <h2>Link to Project</h2>
              </>
            )}
            <button onClick={this.handleEdit}>{buttonText}</button>
          </div>
        );
      } else if (this.props.name === "description") {
        return (
          <div className={"field " + className}>
            <div dangerouslySetInnerHTML={{ __html: text }} />
            <button className="editor-button" onClick={this.handleEdit}>
              {buttonText}
            </button>
          </div>
        );
      }
      return (
        <div className={"field " + className}>
          <div name={name} dangerouslySetInnerHTML={{ __html: text }} />
          <button className="editor-button" onClick={this.handleEdit}>
            {buttonText}
          </button>
        </div>
      );
    } else if (!disabled && editing && type === "select" && !!selectOptions) {
      return (
        <div className={"field " + className}>
          <select
            value={text}
            onChange={this.handleSelectChange}
            onBlur={this.handleSelectChange}
          >
            {selectOptions.map((option) => (
              <option value={option}>{option}</option>
            ))}
          </select>

          {save && <button onClick={this.handleSave}>Save</button>}
        </div>
      );
    } else if (!disabled && editing && type === "plain") {
      return (
        <div className={"field " + className}>
          <input
            type="text"
            placeholder={this.props.placeholder}
            value={text}
            onChange={this.handleTextChange}
            onBlur={this.handleTextChange}
          />
          {save && <button onClick={this.handleSave}>Save</button>}
        </div>
      );
    }
    return (
      <div className={"field " + className}>
        <ReactQuill
          modules={TCSEditor.modules}
          theme={"snow"}
          placeholder={this.props.placeholder}
          value={this.state.text}
          onChange={this.handleChange}
        />

        {save && (
          <button className="done" onClick={this.handleSave}>
            Done
          </button>
        )}
      </div>
    );
  }
}

TCSEditor.modules = {
  // ...

  htmlEditButton: {
    debug: true, // logging, default:false
    msg: "Edit the content in HTML format", //Custom message to display in the editor, default: Edit HTML here, when you click "OK" the quill editor's contents will be replaced
    okText: "Ok", // Text to display in the OK button, default: Ok,
    cancelText: "Cancel", // Text to display in the cancel button, default: Cancel
    buttonHTML: "&lt;&gt;", // Text to display in the toolbar button, default: <>
    buttonTitle: "Show HTML source", // Text to display as the tooltip for the toolbar button, default: Show HTML source
    syntax: false, // Show the HTML with syntax highlighting. Requires highlightjs on window.hljs (similar to Quill itself), default: false
    prependSelector: "#root", // a string used to select where you want to insert the overlayContainer, default: null (appends to body),
    editorModules: {}, // The default mod
  },
};

/*TCSEditor.modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      "EditHTML": EditHTMLClick,
    }
  }
}*/
export default TCSEditor;
