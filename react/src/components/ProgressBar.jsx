import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

function ProgressBarElement({value, label}) {

  return (
    <ProgressBar animated={true} striped={true} now={value} label={`${label} %`}/>
  );
}

export default ProgressBarElement;
