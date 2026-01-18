"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MetricGaugeProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

export function MetricGauge({ title, value, max, unit, color }: MetricGaugeProps) {
  const percentage = (value / max) * 100;
  const data = [
    { name: "used", value: value },
    { name: "free", value: max - value },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill="#1e293b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-slate-100">
              {value.toFixed(1)}
              <span className="text-sm text-slate-400 ml-1">{unit}</span>
            </div>
            <div className="text-xs text-slate-500">{percentage.toFixed(0)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
