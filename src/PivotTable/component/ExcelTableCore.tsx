import React from 'react';
import PropTypes from 'prop-types';
import ExcelData from '../core/ExcelData';
import TableRenderers from './TableRenderers';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

interface ExcelTableCoreProps {
  rendererName: string,
  renderers: { [key: string]: Function },
}

class ExcelTableCore extends React.PureComponent<ExcelTableCoreProps> {

  static defaultProps = {
    ...ExcelData.defaultProps,
    rendererName: 'Table',
    renderers: TableRenderers,
  }

  render() {
    const Renderer = this.props.renderers[
      this.props.rendererName in this.props.renderers
        ? this.props.rendererName
        : Object.keys(this.props.renderers)[0]
    ];
    return <Renderer {...this.props} />;
  }
}

export default ExcelTableCore;
