import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "./quill.snow.scss";
import { htmlEditButton } from "quill-html-edit-button";

ReactQuill.Quill.register("modules/htmlEditButton", htmlEditButton);

const TCSEditor = (props) => {
  const [state, setState] = useState({
    text: props.text,
    type: props.type,
    selectOptions: props.selectOptions,
    disabled: props.disabled,
    placeholder: props.placeholder,
    name: props.name,
    editing: false,
    buttonText: props.buttonText ? props.buttonText : "Edit",
    save: true,
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, ...props }));
  }, [props]);

  const handleChange = (value) => {
    setState((prevState) => ({ ...prevState, text: value }));
    props.onEditorChange(value);
  };

  const handleSelectChange = (event) => {
    const newValue = event.target.value;

    setState((prevState) => ({ ...prevState, text: newValue }));
    props.onEditorChange(event.target.value);
  };

  const handleTextChange = (event) => {
    const newValue = event.target.value;
    setState((prevState) => ({ ...prevState, text: newValue }));
    props.onEditorChange(event.target.value);
  };

  const handleEdit = () => {
    setState((prevState) => ({ ...prevState, editing: !prevState.editing }));
  };

  const handleSave = () => {
    const { editing, text } = state;
    console.log("TEXT", text);
    setState((prevState) => ({ ...prevState, editing: !editing }));
    props.onEditorSave(text);
  };

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
  } = state;

  const { className, url } = props; // Extract className and url from props

  if (!!disabled) {
    return (
      <div className={"field " + className}>
        <div className="ql-editor" style={{ padding: 0 }} name={name} dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    );
  } else if (!disabled && !editing) {
    if (url) {
      // Changed this.props.url to url
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
          <button onClick={handleEdit}>{buttonText}</button>{" "}
          {/* Changed this.handleEdit to handleEdit */}
        </div>
      );
    } else if (name === "description") {
      // Changed this.props.name to name
      return (
        <div className={"field " + className}>
          <div className="ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: text }} />
          <button className="editor-button" onClick={handleEdit}>
            {buttonText}
          </button>
        </div>
      );
    }
    return (
      <div className={"field " + className}>
        <div className="ql-editor" style={{ padding: 0 }} name={name} dangerouslySetInnerHTML={{ __html: text }} />
        <button className="editor-button" onClick={handleEdit}>
          {buttonText}
        </button>
      </div>
    );
  } else if (!disabled && editing && type === "select" && !!selectOptions) {
    return (
      <div className={"field " + className}>
        <select
          value={text}
          onChange={handleSelectChange}
          onBlur={handleSelectChange}
        >
          {selectOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option> // Added key to each option for better React performance
          ))}
        </select>

        {save && <button onClick={handleSave}>Save</button>}
      </div>
    );
  } else if (!disabled && editing && type === "plain") {
    return (
      <div className={"field " + className}>
        <input
          type="text"
          placeholder={placeholder} // Changed this.props.placeholder to placeholder
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextChange}
        />
        {save && <button onClick={handleSave}>Save</button>}
      </div>
    );
  }
  return (
    <div className={"field " + className}>
      <ReactQuill
        modules={TCSEditor.modules}
        theme={"snow"}
        placeholder={placeholder} // Changed this.props.placeholder to placeholder
        value={text || ""} // Changed this.state.text to text
        onChange={handleChange} // Changed this.handleChange to handleChange
      />

      {save && (
        <button className="done" onClick={handleSave}>
          Done
        </button>
      )}
    </div>
  );
};

TCSEditor.modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'code'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'code-block'],
    ['clean']
  ],
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
