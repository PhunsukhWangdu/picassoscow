import React from 'react';
import ReactJsonView from 'react-json-view';

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      src: this.getExampleJson()
    };
  }

  getExampleJson = () => {
    return {
      string: "this is a test string",
      integer: 42,
      array: [1, 2, 3, "test", NaN],
      float: 3.14159,
      undefined: undefined,
      object: {
        "first-child": true,
        "second-child": false,
        "last-child": null
      },
      string_number: "1234",
      date: new Date()
    }
  }

  render() {
    return (
      <ReactJsonView
        src={this.getExampleJson()}
      />
    )
  }
}
