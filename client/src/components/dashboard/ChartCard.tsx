import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import Chart from 'chart.js/auto';

type ChartCardProps = {
  title: string;
  type: 'monthly' | 'category' | 'line' | 'pie' | 'bar' | 'radar';
  data: any;
  options?: string[];
  onOptionChange?: (option: string) => void;
  description?: string;
};

const ChartCard = ({ title, type, data, options = [], onOptionChange, description }: ChartCardProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  // Keep a local copy of data to prevent charts from disappearing
  const [chartData, setChartData] = useState(data);

  // Update local data when prop changes
  useEffect(() => {
    setChartData(data);
  }, [data]);

  // Create/update chart when component mounts or data changes
  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
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
    };

    // Color palette for multiple datasets
    const colorPalette = [
      '#2DD4BF', '#0F766E', '#3B82F6', '#8B5CF6', 
      '#EC4899', '#EF4444', '#F59E0B', '#10B981',
      '#6366F1', '#D946EF', '#F97316', '#06B6D4'
    ];

    if (type === 'monthly') {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Income',
              data: chartData.income,
              backgroundColor: '#10B981',
              borderRadius: 4
            },
            {
              label: 'Expenses',
              data: chartData.expenses,
              backgroundColor: '#EF4444',
              borderRadius: 4
            }
          ]
        },
        options: commonOptions
      });
    } else if (type === 'category') {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartData.labels,
          datasets: [{
            data: chartData.values,
            backgroundColor: colorPalette.slice(0, chartData.labels.length),
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
    } else if (type === 'line') {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map((dataset: any, index: number) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: colorPalette[index % colorPalette.length],
            backgroundColor: `${colorPalette[index % colorPalette.length]}33`,
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }))
        },
        options: {
          ...commonOptions,
          elements: {
            point: {
              radius: 3
            }
          }
        }
      });
    } else if (type === 'pie') {
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [{
            data: chartData.values,
            backgroundColor: colorPalette.slice(0, chartData.labels.length),
            borderWidth: 1,
            borderColor: '#1E1E1E'
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
                padding: 10
              }
            }
          }
        }
      });
    } else if (type === 'bar') {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map((dataset: any, index: number) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: colorPalette[index % colorPalette.length],
            borderRadius: 4
          }))
        },
        options: commonOptions
      });
    } else if (type === 'radar') {
      chartInstance.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets.map((dataset: any, index: number) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: `${colorPalette[index % colorPalette.length]}33`,
            borderColor: colorPalette[index % colorPalette.length],
            borderWidth: 2,
            pointBackgroundColor: colorPalette[index % colorPalette.length]
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              pointLabels: {
                color: '#9CA3AF'
              },
              grid: {
                color: 'rgba(42, 42, 42, 0.5)'
              },
              angleLines: {
                color: 'rgba(42, 42, 42, 0.7)'
              },
              ticks: {
                color: '#9CA3AF',
                backdropColor: 'transparent'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, chartData]);

  return (
    <Card className="bg-card border border-border p-6">
      <div className="flex justify-between items-center mb-2">
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
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </Card>
  );
};

export default ChartCard;
