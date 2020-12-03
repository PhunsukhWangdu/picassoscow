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



const ExcelTableCoreRender = (props: ExcelTableCoreProps) => {
  
  const renderProps = {
    ...ExcelTableCoreRender.defaultProps,
    ...(props || {}),
  }

  const Renderer = renderProps.renderers[
    renderProps.rendererName in renderProps.renderers
      ? renderProps.rendererName
      : Object.keys(renderProps.renderers)[0]
  ];
  return (
    <Renderer {...renderProps} />
  )
};

ExcelTableCoreRender.defaultProps = {
  ...ExcelData.defaultProps,
  rendererName: 'Table',
  renderers: TableRenderers,
}

export default ExcelTableCoreRender;
