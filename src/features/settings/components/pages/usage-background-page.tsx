"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "~/components/ui/chart";
import type { UsageData } from "~/features/usage/actions";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";

import { SettingsSection } from "../ui/settings-section";
import {
  formatCost,
  formatTokens,
  StatCard,
  UsagePageLayout,
  useUsagePage,
} from "./usage-shared";

const UTILITY_TYPE_LABELS: Record<string, string> = {
  title: "Title Generation",
  icon: "Icon Selection",
  metadata: "Metadata",
  tags: "Auto-Tagging",
  handoff: "Handoff Summary",
};

const utilityBarConfig = {
  cost: { label: "Cost", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

function UtilityBreakdownChart({ data }: { data: UsageData["utilityUsage"]["typeBreakdown"] }) {
  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">No background usage data.</p>;
  }

  const chartData = data.map(d => ({
    type: UTILITY_TYPE_LABELS[d.type] ?? d.type,
    cost: d.cost,
    calls: d.calls,
  }));

  return (
    <ChartContainer
      config={utilityBarConfig}
      className="aspect-auto h-48 w-full"
    >
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `$${v}`}
        />
        <YAxis
          type="category"
          dataKey="type"
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <ChartTooltip
          content={(
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const calls = (item.payload as Record<string, unknown>)?.calls;
                return `${formatCost(Number(value))} (${Number(calls).toLocaleString()} calls)`;
              }}
            />
          )}
        />
        <Bar dataKey="cost" fill="var(--color-cost)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function UsageBackgroundPage() {
  const { period, setPeriod, data, isLoading } = useUsagePage();

  return (
    <UsagePageLayout period={period} setPeriod={setPeriod} data={data} isLoading={isLoading}>
      {data && (
        <>
          <SettingsSection title="Background Usage">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total Calls" value={data.utilityUsage.totalCalls.toLocaleString()} />
              <StatCard label="Cost" value={formatCost(data.utilityUsage.totalCost)} />
              <StatCard label="Input Tokens" value={formatTokens(data.utilityUsage.inputTokens)} />
              <StatCard label="Output Tokens" value={formatTokens(data.utilityUsage.outputTokens)} />
            </div>
          </SettingsSection>

          <SettingsSection title="By Type">
            <UtilityBreakdownChart data={data.utilityUsage.typeBreakdown} />
          </SettingsSection>
        </>
      )}
    </UsagePageLayout>
  );
}
