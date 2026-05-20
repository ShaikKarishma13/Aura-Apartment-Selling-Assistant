import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function ChartSection({ leads }) {

  // ✅ GROUP LEADS BY DAY
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const data = days.map((day, index) => {
    const count = leads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return d.getDay() === index;
    }).length;

    return {
      name: day,
      leads: count,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      
      {/* 🔵 LINE CHART */}
      <div className="chart-container" style={{ height: "300px" }}>
        <h2>Leads This Week 📈</h2>

        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line type="monotone" dataKey="leads" stroke="#00f5ff" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🟠 BAR CHART */}
      <div className="chart-container" style={{ height: "350px" }}>
        <h2>Weekly Performance 📊</h2>

        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Bar dataKey="leads" fill="#ff7f50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default ChartSection;