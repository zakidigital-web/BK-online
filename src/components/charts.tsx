import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts"

const RIASEC_COLORS: Record<string, string> = {
  R: "#ef4444", I: "#3b82f6", A: "#a855f7",
  S: "#22c55e", E: "#f97316", C: "#eab308",
}

const VARK_COLORS = ["#06b6d4", "#f97316", "#8b5cf6", "#22c55e"]

export function RiasecBarChart({ data }: { data: { tipe: string; jumlah: number; persen: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="tipe" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Bar dataKey="persen" radius={[6, 6, 0, 0]} label={{ position: "top", fontSize: 11 }}>
          {data.map((entry) => {
            const tipe = entry.tipe.split("/")[0] || entry.tipe.charAt(0)
            return <Cell key={entry.tipe} fill={RIASEC_COLORS[tipe] || "#3b82f6"} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function VarkPieChart({ data }: { data: { tipe: string; jumlah: number; persen: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="persen"
          nameKey="tipe"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
          label={false}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={VARK_COLORS[i % VARK_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function PsikologiRadarChart({ data }: { data: { label: string; skor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="skor" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function BigFiveRadarChart({ data }: { data: { label: string; skor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="skor" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function StudentRadarChart({
  riasec, vark, psikologi, karakter,
}: {
  riasec?: { urutan: { kode: string; label: string; skor: number }[] }
  vark?: { urutan: { kode: string; label: string; skor: number }[] }
  psikologi?: { dimensi: { label: string; skor: number }[] }
  karakter?: { urutan: { kode: string; label: string; skor: number; tingkat: string }[] }
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {riasec && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Minat Bakat (RIASEC)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={riasec.urutan.map((i) => ({ label: `${i.kode} ${i.label}`, skor: i.skor }))}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 30]} tick={false} axisLine={false} />
              <Radar dataKey="skor" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      {vark && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Gaya Belajar (VARK)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={vark.urutan.map((i) => ({ label: `${i.kode} ${i.label}`, skor: i.skor }))}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="skor" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      {psikologi && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Screening Psikologi</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={psikologi.dimensi}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="skor" stroke="#f97316" fill="#f97316" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      {karakter && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Karakter (Big Five)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={karakter.urutan.map((i) => ({ label: i.label, skor: i.skor }))}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="skor" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
