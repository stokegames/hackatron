var React = require('react');

React.StyleSheet = {
    create: function(styles) {
        return styles;
    }
};

React.View = React.createClass({
  displayName: "View",

  render: function render() {
    return React.createElement(
      "div",
      this.props,
      this.props.children
    );
  }
});

React.Text = React.createClass({
  displayName: "Text",

  render: function render() {
    return React.createElement(
      "div",
      this.props,
      this.props.children
    );
  }
});

React.Img = React.createClass({
  displayName: "Img",

  render: function render() {
    return React.createElement(
      "img",
      this.props
    );
  }
});

if (typeof window !== 'undefined') {
  window.View = React.View;
  window.Text = React.Text;
  window.Img = React.Img;
}

module.exports = {
  View: React.View,
  Text: React.Text,
  StyleSheet: React.StyleSheet,
  Img: React.Img
};
