import React from 'react';

interface IObject {
  [key: string]: any
}

// 后面替换为 antd select
export default (props: IObject) => {
  return (
    <div className="pvtDropdown" style={{zIndex: props.zIndex}}>
      <div
        onClick={e => {
          e.stopPropagation();
          props.toggle();
        }}
        className={
          'pvtDropdownValue pvtDropdownCurrent ' +
          (props.open ? 'pvtDropdownCurrentOpen' : '')
        }
        role="button"
      >
        <div className="pvtDropdownIcon">{props.open ? '×' : '▾'}</div>
        {props.current || <span>&nbsp;</span>}
      </div>

      {props.open && (
        <div className="pvtDropdownMenu">
          {props.values.map(r => (
            <div
              key={r}
              role="button"
              onClick={e => {
                e.stopPropagation();
                if (props.current === r) {
                  props.toggle();
                } else {
                  props.setValue(r);
                }
              }}
              className={
                'pvtDropdownValue ' +
                (r === props.current ? 'pvtDropdownActiveValue' : '')
              }
            >
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
