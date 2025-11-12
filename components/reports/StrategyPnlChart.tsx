// Fix: Replaced the placeholder with a functional SVG line chart to visualize PnL history.
import React, { useMemo, useState } from 'react';
import { Card } from '../shared/Card.tsx';
import { useTranslation } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

// Define the structure for a single point in the PnL history data
type PnlDataPoint = {
    date: Date;
    dca: number;
    grid: number;
    momentum: number;
    ma_crossover: number;
};

/**
 * Generates 30 days of mock PnL history data for three distinct strategies.
 * Each strategy has a different simulated behavior to create a realistic-looking chart.
 * @returns An array of PnL data points.
 */
const generatePnlHistory = (): PnlDataPoint[] => {
    const data: PnlDataPoint[] = [];
    let dcaPnl = 100;
    let gridPnl = 150;
    let momentumPnl = 80;
    let maCrossoverPnl = 120;

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Simulate different strategy behaviors for visual distinction
        dcaPnl += (Math.random() - 0.4) * 15 + 2; // Simulates steady, slow growth
        gridPnl += (Math.random() - 0.5) * 40; // Simulates volatile, range-bound performance
        momentumPnl += (Math.random() - 0.45) * 25 + (i < 15 ? 5 : -2); // Simulates a trending behavior
        maCrossoverPnl += (Math.random() - 0.48) * 30 + 1; // Simulates trend-following but less aggressive than momentum

        data.push({
            date,
            dca: parseFloat(dcaPnl.toFixed(2)),
            grid: parseFloat(gridPnl.toFixed(2)),
            momentum: parseFloat(momentumPnl.toFixed(2)),
            ma_crossover: parseFloat(maCrossoverPnl.toFixed(2)),
        });
    }
    return data;
};

export const StrategyPnlChart: React.FC = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    // Generate and memoize the chart data to prevent recalculation on re-renders
    const chartData = useMemo(() => generatePnlHistory(), []);

    // Define chart dimensions and margins
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate data boundaries to set up scales
    const allPnlValues = chartData.flatMap(d => [d.dca, d.grid, d.momentum, d.ma_crossover]);
    const minPnl = Math.min(...allPnlValues, 0); // Ensure Y-axis starts at or below 0
    const maxPnl = Math.max(...allPnlValues);
    const startDate = chartData[0]?.date;
    const endDate = chartData[chartData.length - 1]?.date;

    // Create scaling functions to map data values to SVG coordinates
    const xScale = (date: Date): number => {
        if (!startDate || !endDate) return 0;
        const timeRange = endDate.getTime() - startDate.getTime();
        return timeRange > 0 ? ((date.getTime() - startDate.getTime()) / timeRange) * innerWidth : 0;
    };

    const yScale = (pnl: number): number => {
        const pnlRange = maxPnl - minPnl;
        return pnlRange > 0 ? innerHeight - ((pnl - minPnl) / pnlRange) * innerHeight : innerHeight / 2;
    };

    // Function to generate the 'd' attribute for an SVG path from data points
    const createLinePath = (dataKey: keyof Omit<PnlDataPoint, 'date'>): string => {
        return chartData
            .map((d, i) => {
                const x = xScale(d.date);
                const y = yScale(d[dataKey]);
                return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
    };

    // Generate paths for each strategy
    const paths = {
        dca: createLinePath('dca'),
        grid: createLinePath('grid'),
        momentum: createLinePath('momentum'),
        ma_crossover: createLinePath('ma_crossover'),
    };
    
    // Define colors for each strategy line
    const colors = {
      dca: '#06b6d4',      // tailwind.cyan-500
      grid: '#22c55e',      // tailwind.green-500
      momentum: '#f59e0b',  // tailwind.amber-500
      ma_crossover: '#8b5cf6', // tailwind.violet-500
    };

    // Adapt colors to the current theme
    const axisColor = theme === 'dark' ? '#4D586F' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#e5e7eb' : '#374151';
    const cardBgColor = theme === 'dark' ? '#1A2233' : '#ffffff';

    // Calculate positions for Y-axis ticks and grid lines
    const yAxisTicksCount = 5;
    const pnlStep = (maxPnl - minPnl) / (yAxisTicksCount - 1);
    const yTicks = Array.from({ length: yAxisTicksCount }, (_, i) => minPnl + i * pnlStep);
    
    // Event handlers for interactivity
    const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
        const svgRect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        
        const index = Math.min(
            chartData.length - 1,
            Math.max(0, Math.round(mouseX / (innerWidth / (chartData.length - 1))))
        );
        
        if (index !== hoveredIndex) {
            setHoveredIndex(index);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };
    
    const hoveredData = hoveredIndex !== null ? chartData[hoveredIndex] : null;

    const renderTooltip = () => {
        if (!hoveredData) return null;

        const x = xScale(hoveredData.date);
        const tooltipWidth = 160;
        const tooltipHeight = 120;

        let tooltipX = x + 15;
        if (tooltipX + tooltipWidth > innerWidth) {
            tooltipX = x - tooltipWidth - 15;
        }
        
        const tooltipY = 10;

        return (
            <g transform={`translate(${tooltipX}, ${tooltipY})`} style={{ pointerEvents: 'none' }}>
                <rect width={tooltipWidth} height={tooltipHeight} rx="5" fill={theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'} stroke={axisColor} />
                <text x="10" y="20" fill={textColor} fontSize="12" fontWeight="bold">
                    {hoveredData.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </text>
                
                <g transform="translate(10, 35)">
                    <circle cx="5" cy="5" r="3" fill={colors.dca} />
                    <text x="15" y="8" fill={textColor} fontSize="11">{t('strategy_dca_name')}:</text>
                    <text x={tooltipWidth - 20} y="8" fill={textColor} fontSize="11" textAnchor="end" fontWeight="bold">${hoveredData.dca.toFixed(2)}</text>
                    
                    <circle cx="5" cy="25" r="3" fill={colors.grid} />
                    <text x="15" y="28" fill={textColor} fontSize="11">{t('strategy_grid_name')}:</text>
                    <text x={tooltipWidth - 20} y="28" fill={textColor} fontSize="11" textAnchor="end" fontWeight="bold">${hoveredData.grid.toFixed(2)}</text>

                    <circle cx="5" cy="45" r="3" fill={colors.momentum} />
                    <text x="15" y="48" fill={textColor} fontSize="11">{t('strategy_momentum_name')}:</text>
                    <text x={tooltipWidth - 20} y="48" fill={textColor} fontSize="11" textAnchor="end" fontWeight="bold">${hoveredData.momentum.toFixed(2)}</text>

                    <circle cx="5" cy="65" r="3" fill={colors.ma_crossover} />
                    <text x="15" y="68" fill={textColor} fontSize="11">{t('strategy_ma_crossover_name')}:</text>
                    <text x={tooltipWidth - 20} y="68" fill={textColor} fontSize="11" textAnchor="end" fontWeight="bold">${hoveredData.ma_crossover.toFixed(2)}</text>
                </g>
            </g>
        );
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports_strategy_pnl_title')}</h3>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px] font-sans">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {/* Render Y-axis ticks and grid lines */}
                        {yTicks.map(tick => (
                            <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                                <line x1={-5} y1="0" x2={innerWidth} y2="0" stroke={axisColor} strokeDasharray="2,2" />
                                <text x={-10} y={4} fill={textColor} textAnchor="end" fontSize="10" className="font-medium">
                                    ${Math.round(tick).toLocaleString()}
                                </text>
                            </g>
                        ))}

                        {/* Render X-axis line */}
                        <line x1="0" y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke={axisColor} />
                        
                        {/* Render X-axis labels */}
                        {startDate && (
                             <text x={0} y={innerHeight + 20} fill={textColor} textAnchor="start" fontSize="10">
                                {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </text>
                        )}
                        {endDate && (
                            <text x={innerWidth} y={innerHeight + 20} fill={textColor} textAnchor="end" fontSize="10">
                                {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </text>
                        )}
                        
                        {/* Render PnL data lines for each strategy */}
                        <path d={paths.dca} fill="none" stroke={colors.dca} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={paths.grid} fill="none" stroke={colors.grid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={paths.momentum} fill="none" stroke={colors.momentum} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={paths.ma_crossover} fill="none" stroke={colors.ma_crossover} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Transparent rectangle for capturing mouse events */}
                        <rect
                            width={innerWidth}
                            height={innerHeight}
                            fill="transparent"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            cursor="crosshair"
                        />

                        {/* Hover Effects */}
                        {hoveredData && (
                            <g style={{ pointerEvents: 'none' }}>
                                <line
                                    x1={xScale(hoveredData.date)} y1="0"
                                    x2={xScale(hoveredData.date)} y2={innerHeight}
                                    stroke={axisColor} strokeWidth="1"
                                />
                                <circle cx={xScale(hoveredData.date)} cy={yScale(hoveredData.dca)} r="4" fill={colors.dca} stroke={cardBgColor} strokeWidth="2" />
                                <circle cx={xScale(hoveredData.date)} cy={yScale(hoveredData.grid)} r="4" fill={colors.grid} stroke={cardBgColor} strokeWidth="2" />
                                <circle cx={xScale(hoveredData.date)} cy={yScale(hoveredData.momentum)} r="4" fill={colors.momentum} stroke={cardBgColor} strokeWidth="2" />
                                <circle cx={xScale(hoveredData.date)} cy={yScale(hoveredData.ma_crossover)} r="4" fill={colors.ma_crossover} stroke={cardBgColor} strokeWidth="2" />
                                {renderTooltip()}
                            </g>
                        )}
                    </g>
                </svg>
            </div>
            {/* Chart Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full me-2" style={{ backgroundColor: colors.dca }}></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('strategy_dca_name')}</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full me-2" style={{ backgroundColor: colors.grid }}></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('strategy_grid_name')}</span>
                </div>
                 <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full me-2" style={{ backgroundColor: colors.momentum }}></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('strategy_momentum_name')}</span>
                </div>
                 <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full me-2" style={{ backgroundColor: colors.ma_crossover }}></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('strategy_ma_crossover_name')}</span>
                </div>
            </div>
        </Card>
    );
};