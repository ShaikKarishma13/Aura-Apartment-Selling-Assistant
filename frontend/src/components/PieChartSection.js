import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PieChartSection({ leads, setFilter}) {
  const data = [
    { name: "Hot", value: leads.filter(l => l.status === "Hot").length },
    { name: "Warm", value: leads.filter(l => l.status === "Warm").length },
    { name: "Cold", value: leads.filter(l => l.status === "Cold").length },
  ].filter(item => item.value > 0); // ✅ remove zero values

  const COLORS = ["#ff4d4d", "#ffa500", "#4da6ff"];

  return (
    <div className="chart-container">
      <h2>Lead Distribution 🔥</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={110}
            label
            onClick={(entry) => setFilter(entry.name)}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartSection;