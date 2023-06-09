import React from 'react';
import {Pie} from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto';

function PieChart({data, options, title, ref}) {

  return (
    <>
      <h4 className="text-center text-capitalize">{title}</h4>
      <Pie data={data} options={options} ref={ref}/>
    </>
  );
}

export default PieChart;
