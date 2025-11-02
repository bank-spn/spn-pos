interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export const SimpleBarChart = ({ data, height = 300, color = '#3b82f6' }: BarChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2 px-4">
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1"
              style={{ maxWidth: `${barWidth}%` }}
            >
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '85%' }}>
                <span className="text-xs font-medium mb-1">
                  {item.value.toLocaleString()}
                </span>
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: item.value > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
