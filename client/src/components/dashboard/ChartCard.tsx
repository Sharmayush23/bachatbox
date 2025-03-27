import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import Chart from 'chart.js/auto';

type ChartCardProps = {
  title: string;
  type: 'monthly' | 'category';
  data: any;
  options?: string[];
  onOptionChange?: (option: string) => void;
};

const ChartCard = ({ title, type, data, options = [], onOptionChange }: ChartCardProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (type === 'monthly') {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Income',
              data: data.income,
              backgroundColor: '#10B981',
              borderRadius: 4
            },
            {
              label: 'Expenses',
              data: data.expenses,
              backgroundColor: '#EF4444',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#9CA3AF'
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(42, 42, 42, 0.5)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            y: {
              grid: {
                color: 'rgba(42, 42, 42, 0.5)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    } else if (type === 'category') {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: [
              '#2DD4BF', '#0F766E', '#3B82F6', 
              '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#9CA3AF',
                boxWidth: 15,
                padding: 15
              }
            }
          },
          cutout: '70%'
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data]);

  return (
    <Card className="bg-card border border-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-foreground">{title}</h3>
        {options.length > 0 && (
          <div className="relative">
            <select 
              className="bg-background border border-border text-foreground text-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
              onChange={(e) => onOptionChange && onOptionChange(e.target.value)}
            >
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </Card>
  );
};

export default ChartCard;
