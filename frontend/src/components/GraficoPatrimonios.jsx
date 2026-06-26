import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function GraficoPatrimonios({ dados }) {
  const grafico = [
    {
      name: "Disponíveis",
      value: dados.disponiveis,
    },
    {
      name: "Emprestados",
      value: dados.emprestados,
    },
  ];

  const cores = ["#28a745", "#dc3545"];

  return (
    <div className="mt-4 text-center">
      <h4>Situação dos Patrimônios</h4>

      <PieChart width={400} height={300}>
        <Pie
          data={grafico}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {grafico.map((entry, index) => (
            <Cell
              key={index}
              fill={cores[index]}
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default GraficoPatrimonios;