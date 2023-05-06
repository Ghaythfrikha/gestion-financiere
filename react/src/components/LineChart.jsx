import React from 'react';
import {Line} from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto';

function LineChart({data, options, title}) {

  return (
    <>
      <h4 className="text-center text-capitalize">{title}</h4>
      <Line data={data} options={options}/>
    </>
  );
}

export default LineChart;
