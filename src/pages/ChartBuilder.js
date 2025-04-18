import AnalyticsIcon from '@mui/icons-material/Analytics';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ResetIcon from '@mui/icons-material/Refresh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis
} from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const ChartBuilder = () => {
  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('X-Axis');
  const [yAxisLabel, setYAxisLabel] = useState('Y-Axis');
  const [chartHeight, setChartHeight] = useState(400);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [xColumn, setXColumn] = useState('');
  const [yColumns, setYColumns] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showReferenceLines, setShowReferenceLines] = useState(false);
  const [referenceValue, setReferenceValue] = useState(0);
  const [analysisTab, setAnalysisTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const calculateStatsForColumn = useCallback((data, column) => {
    if (!data || !column) return null;
    
    const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate median
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
    
    // Calculate standard deviation
    const squareDiffs = values.map(val => Math.pow(val - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    // Calculate quartiles
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    return {
        sum,
        average: avg,
        max,
        min,
        median,
        standardDeviation: stdDev,
        quartile1: q1,
        quartile3: q3
    };
  }, []);

  const calculateStats = useCallback(() => {
    if (!chartData || !xColumn || !yColumns.length) {
        setStats({});
        return;
    }

    const newStats = {};
    yColumns.forEach(column => {
        newStats[column] = calculateStatsForColumn(chartData, column);
    });
    setStats(newStats);
  }, [chartData, xColumn, yColumns, calculateStatsForColumn]);

  useEffect(() => {
    calculateStats();
  }, [chartData, xColumn, yColumns, calculateStats]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let parsedData;
        let headers;

        if (file.name.endsWith('.csv')) {
          const lines = data.split('\n');
          headers = lines[0].split(',').map(h => h.trim());
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const item = {};
            headers.forEach((header, index) => {
              item[header] = isNaN(values[index]) ? values[index] : Number(values[index]);
            });
            return item;
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
          headers = Object.keys(parsedData[0] || {});
        }

        // Identify numeric columns
        const numericCols = headers.filter(header => {
          return parsedData.some(item => typeof item[header] === 'number');
        });

        setAvailableColumns(headers || []);
        setNumericColumns(numericCols || []);
        setChartData(parsedData || []);
        
        if (headers && headers.length >= 2) {
          setXColumn(headers[0]);
          setYColumns(numericCols.slice(0, 3)); // Select first 3 numeric columns by default
        }
      } catch (error) {
        alert('Error parsing file: ' + error.message);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const filteredData = useMemo(() => {
    if (!chartData || !xColumn || !yColumns.length) return [];

    let data = [...chartData];

    // Apply column filters
    if (Object.keys(columnFilters).length > 0) {
      data = data.filter(row => {
        return Object.entries(columnFilters).every(([column, value]) => {
          if (!value) return true; // Skip empty filters
          const rowValue = row[column]?.toString().toLowerCase() || '';
          return rowValue.includes(value.toLowerCase());
        });
      });
    }

    // Apply numeric range filters
    if (Object.keys(filters).length > 0) {
      data = data.filter(row => {
        return Object.entries(filters).every(([column, range]) => {
          if (!range || (range.min === '' && range.max === '')) return true; // Skip empty filters
          const value = Number(row[column]);
          if (isNaN(value)) return true; // Skip non-numeric values
          const min = range.min === '' ? -Infinity : Number(range.min);
          const max = range.max === '' ? Infinity : Number(range.max);
          return value >= min && value <= max;
        });
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return data;
  }, [chartData, xColumn, yColumns, columnFilters, filters, sortConfig]);

  const handleFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleRangeFilterChange = (column, min, max) => {
    setFilters(prev => ({
      ...prev,
      [column]: { min, max }
    }));
  };

  const handleSort = (column) => {
    setSortConfig(prev => ({
      key: column,
      direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderFilterControls = () => {
    if (!showFilters) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setShowFilters(false)}>
            <ClearIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          {availableColumns.map(column => (
            <Grid item xs={12} sm={6} md={4} key={column}>
              <TextField
                fullWidth
                label={`Filter ${column}`}
                value={columnFilters[column] || ''}
                onChange={(e) => handleFilterChange(column, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
          {numericColumns.map(column => (
            <Grid item xs={12} sm={6} md={4} key={`range-${column}`}>
              <Typography variant="subtitle2" gutterBottom>
                {column} Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="number"
                  label="Min"
                  value={filters[column]?.min || ''}
                  onChange={(e) => handleRangeFilterChange(
                    column,
                    parseFloat(e.target.value),
                    filters[column]?.max
                  )}
                  size="small"
                />
                <TextField
                  type="number"
                  label="Max"
                  value={filters[column]?.max || ''}
                  onChange={(e) => handleRangeFilterChange(
                    column,
                    filters[column]?.min,
                    parseFloat(e.target.value)
                  )}
                  size="small"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  const renderChart = () => {
    if (filteredData.length === 0 || !xColumn || yColumns.length === 0) {
      return (
        <Box
          sx={{
            height: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #ccc',
            borderRadius: 1,
            backgroundColor: '#f8f9fa',
          }}
        >
          <Typography color="textSecondary">
            {!selectedFile ? 'Please upload a file to generate chart' : 'Please select X and Y axis columns'}
          </Typography>
        </Box>
      );
    }

    const chartContainerStyle = {
      width: '100%',
      height: '70vh',
      minHeight: '500px',
      maxHeight: '90vh',
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'center center',
      transition: 'transform 0.3s ease-in-out',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '20px',
      position: 'relative',
    };

    const commonProps = {
      width: '100%',
      height: '100%',
      data: filteredData,
      margin: { top: 40, right: 40, left: 60, bottom: 40 },
    };

    const renderZoomControls = () => (
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Zoom">
          <IconButton onClick={handleResetZoom}>
            <ResetIcon />
          </IconButton>
        </Tooltip>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
        >
          Filters
        </Button>
      </Box>
    );

    const ChartTitleComponent = (
      <Typography
        variant="h5"
        align="center"
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        {chartTitle || 'Chart Title'}
      </Typography>
    );

    const renderChartContent = () => {
      switch (chartType) {
        case 'bar':
          return (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                label={{ 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { fontSize: '14px', fontWeight: 'bold' }
                }}
              />
              <YAxis 
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '14px', fontWeight: 'bold' }
                }}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '10px'
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
              {yColumns.map((column, index) => (
                <Bar
                  key={column}
                  dataKey={column}
                  fill={COLORS[index % COLORS.length]}
                  name={column}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          );
        case 'line':
          return (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip />
              <Legend />
              {yColumns.map((column, index) => (
                <Line
                  key={column}
                  type="monotone"
                  dataKey={column}
                  stroke={COLORS[index % COLORS.length]}
                  name={column}
                />
              ))}
            </LineChart>
          );
        case 'pie':
          return (
            <PieChart {...commonProps}>
              <Pie
                data={filteredData}
                dataKey={yColumns[0]}
                nameKey={xColumn}
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ name, percent }) => {
                  const percentage = (percent * 100).toFixed(1);
                  return `${name}: ${percentage}%`;
                }}
                labelLine={true}
                labelLineStyle={{ strokeWidth: 1 }}
                labelStyle={{
                  fontSize: '12px',
                  fill: '#333',
                  fontWeight: 'bold',
                }}
                paddingAngle={2}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name, props) => {
                  const percentage = ((value / props.payload.total) * 100).toFixed(1);
                  return [`${name}: ${value} (${percentage}%)`, name];
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{
                  paddingLeft: '20px'
                }}
              />
            </PieChart>
          );
        case 'donut':
          return (
            <PieChart {...commonProps}>
              <Pie
                data={filteredData}
                dataKey={yColumns[0]}
                nameKey={xColumn}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={150}
                label={({ name, percent }) => {
                  const percentage = (percent * 100).toFixed(1);
                  return `${name}: ${percentage}%`;
                }}
                labelLine={true}
                labelLineStyle={{ strokeWidth: 1 }}
                labelStyle={{
                  fontSize: '12px',
                  fill: '#333',
                  fontWeight: 'bold',
                }}
                paddingAngle={2}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name, props) => {
                  const percentage = ((value / props.payload.total) * 100).toFixed(1);
                  return [`${name}: ${value} (${percentage}%)`, name];
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{
                  paddingLeft: '20px'
                }}
              />
            </PieChart>
          );
        case 'radar':
          return (
            <RadarChart {...commonProps} data={filteredData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xColumn} />
              <PolarRadiusAxis />
              {yColumns.map((column, index) => (
                <Radar
                  key={column}
                  name={column}
                  dataKey={column}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
              <RechartsTooltip />
              <Legend />
            </RadarChart>
          );
        case 'area':
          return (
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip />
              <Legend />
              {yColumns.map((column, index) => (
                <Area
                  key={column}
                  type="monotone"
                  dataKey={column}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                  name={column}
                />
              ))}
            </AreaChart>
          );
        case 'scatter':
          return (
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip 
                formatter={(value, name, props) => {
                  return [`${name}: ${value}`, name];
                }}
              />
              <Legend />
              {yColumns.map((column, index) => (
                <Scatter
                  key={column}
                  name={column}
                  data={filteredData}
                  fill={COLORS[index % COLORS.length]}
                  dataKey={column}
                />
              ))}
            </ScatterChart>
          );
        case 'radial':
          return (
            <RadialBarChart {...commonProps} data={filteredData}>
              <RadialBar
                dataKey={yColumns[0]}
                nameKey={xColumn}
                fill="#8884d8"
                label={{ position: 'insideStart', fill: '#fff' }}
              />
              <Legend />
              <RechartsTooltip />
            </RadialBarChart>
          );
        default:
          return (
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip />
              <Legend />
              {yColumns.map((column, index) => (
                <Bar
                  key={column}
                  dataKey={column}
                  fill={COLORS[index % COLORS.length]}
                  name={column}
                />
              ))}
              {yColumns.map((column, index) => (
                <Line
                  key={`line-${column}`}
                  type="monotone"
                  dataKey={column}
                  stroke={COLORS[index % COLORS.length]}
                  name={column}
                />
              ))}
            </ComposedChart>
          );
      }
    };

    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {renderZoomControls()}
        <Box sx={{
          ...chartContainerStyle,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          mx: 'auto'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%',
            maxWidth: '100%'
          }}>
            {ChartTitleComponent}
            <Box sx={{ 
              flex: 1, 
              width: '100%', 
              height: '100%', 
              position: 'relative',
              maxWidth: '100%'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChartContent()}
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderAnalysis = () => {
    if (Object.keys(stats).length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Tabs value={analysisTab} onChange={(_, newValue) => setAnalysisTab(newValue)}>
          {yColumns.map((column, index) => (
            <Tab
              key={column}
              label={column}
              icon={<AnalyticsIcon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
        {yColumns.map((column, index) => (
          <Box
            key={column}
            role="tabpanel"
            hidden={analysisTab !== index}
            sx={{ mt: 2 }}
          >
            <Typography variant="h6" gutterBottom>
              Analysis for {column}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(stats[column] || {}).map(([metric, value]) => (
                    <TableRow key={metric}>
                      <TableCell component="th" scope="row">
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </TableCell>
                      <TableCell align="right">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Chart Builder
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    label="Chart Type"
                  >
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                    <MenuItem value="donut">Donut Chart</MenuItem>
                    <MenuItem value="radar">Radar Chart</MenuItem>
                    <MenuItem value="area">Area Chart</MenuItem>
                    <MenuItem value="scatter">Scatter Plot</MenuItem>
                    <MenuItem value="radial">Radial Bar Chart</MenuItem>
                    <MenuItem value="composed">Composed Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chart Title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="X-Axis Label"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Y-Axis Label"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                />
              </Grid>
              {availableColumns.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>X-Axis Column</InputLabel>
                      <Select
                        value={xColumn}
                        onChange={(e) => setXColumn(e.target.value)}
                        label="X-Axis Column"
                      >
                        {availableColumns.map((column) => (
                          <MenuItem key={column} value={column}>
                            {column}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Y-Axis Columns</InputLabel>
                      <Select
                        multiple
                        value={yColumns}
                        onChange={(e) => setYColumns(e.target.value)}
                        label="Y-Axis Columns"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                      >
                        {numericColumns.map((column) => (
                          <MenuItem key={column} value={column}>
                            <Checkbox checked={yColumns.indexOf(column) > -1} />
                            {column}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Upload Data File
              </Typography>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span">
                  Choose File
                </Button>
              </label>
              {selectedFile && (
                <Typography sx={{ ml: 2, display: 'inline' }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {renderFilterControls()}
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {renderChart()}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {renderAnalysis()}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChartBuilder; 