import React from 'react';
import PropTypes, { any } from 'prop-types';
import ExcelData, { ExcelDataConfig } from '../core/ExcelData';
import TableRenderers from './TableRenderers';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!
interface ExcelTableRenderProps extends ExcelDataConfig {
  renderers: {
    [key: string]: any,
  }[],
  rendererName: string,
  [key: string]: any,
}

const ExcelTableRender = (props: ExcelTableRenderProps, ref: React.Ref<any>) => {
  const renderProps = {
    ...ExcelData.defaultProps,
    ...(props || {}),
  }

  const renderRef = React.useRef({});

  // React.useImperativeHandle(ref, () => ({
  //   getAllKeyVals: () => {
  //     if(!renderRef.current.getExcelDataInfo || !renderRef.current.getExcelDataInfo()) return {};
  //     return renderRef.current.getExcelDataInfo().getAllKeyVals();
  //   }
  // }));

  const Renderer = renderProps.renderers[
    renderProps.rendererName in renderProps.renderers
      ? renderProps.rendererName
      : Object.keys(renderProps.renderers)[0]
  ];

  return (
    <Renderer {...renderProps} onRenderDidMount={renderRef}/>
  )
};

// ExcelTableRender.defaultProps = ExcelData.defaultProps;


export default React.forwardRef(ExcelTableRender);
