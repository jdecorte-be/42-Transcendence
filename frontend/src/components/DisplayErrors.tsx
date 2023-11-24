import React from 'react';

export const DisplayErrors = (props) => {
  const listStyle = {
    listStyle: 'none',
  };
  if (!props.errors || props.errors.length === 0) {
    return null;
  }

  return (
    <div>
      <ul style={listStyle}>
        {props.errors && props.errors.length > 0 && props.errors.map((item) => (
          <li key={`Error: ${item}`}>
            <p>Error: {item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};