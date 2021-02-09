import React from "react";

import { withFirebase } from "../Firebase";

class LazyImage extends React.Component {
  constructor(props) {
    super(props);

    //generate guid
    var guid = "imgxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );

    this.state = {
      loading: true,
      url: "/images/loading.gif",
      guid: guid,
    };
  }
  componentDidMount() {
    this.props.file.getDownloadURL().then((url) => {
      this.setState({ loading: false, url: url });
      console.log(this.props)
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.file.location.path_ !== this.props.file.location.path_)
      this.props.file.getDownloadURL().then((url) => {
        this.setState({ loading: false, url: url });
      });
  }

  render() {
    const { guid, url } = this.state;
    return (
      <img
        className={this.props.className}
        id={guid}
        key={guid}
        id={guid}
        src={url}
      />
    );
  }
}

export default withFirebase(LazyImage);
