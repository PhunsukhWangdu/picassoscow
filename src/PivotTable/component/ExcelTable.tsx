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


const ExcelTableRender = (props: ExcelTableCoreProps, ref: React.Ref<any>) => {
  const renderProps = {
    ...ExcelData.defaultProps,
    ...(props || {}),
  }

  const renderRef = React.useRef();

  React.useImperativeHandle(ref, () => ({
    getAllKeyVals: () => {
      if(!renderRef.current.getExcelDataInfo || !renderRef.current.getExcelDataInfo()) return {};
      return renderRef.current.getExcelDataInfo().getAllKeyVals();
    }
  }));

  const Renderer = renderProps.renderers[
    renderProps.rendererName in renderProps.renderers
      ? renderProps.rendererName
      : Object.keys(renderProps.renderers)[0]
  ];

  return (
    <Renderer {...renderProps} ref={renderRef}/>
  )
};

// ExcelTableRender.defaultProps = ExcelData.defaultProps;


export default React.forwardRef(ExcelTableRender);
