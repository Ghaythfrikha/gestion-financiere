import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

function ProgressBarElement({value, label}) {

  return (
    <ProgressBar now={value} label={`${label} %`}/>
  );
}

export default ProgressBarElement;
