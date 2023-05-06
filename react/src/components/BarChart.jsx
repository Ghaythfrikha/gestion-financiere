import React from 'react';
import { Bar } from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto';

function BarChart({data, options,title}) {

  return (
    <>
      <h4 className="text-center text-capitalize">{title}</h4>
      <Bar data={data} options={options}/>
    </>

  );
}

export default BarChart;
