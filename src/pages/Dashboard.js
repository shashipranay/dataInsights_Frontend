import AddIcon from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import Edit from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
}));

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mock data - replace with actual data from your backend
  const recentFiles = [
    { id: 1, name: 'Sales Data Q1 2023', date: '2023-01-15', type: 'CSV' },
    { id: 2, name: 'Customer Feedback', date: '2023-02-20', type: 'Excel' },
    { id: 3, name: 'Website Analytics', date: '2023-03-10', type: 'CSV' },
  ];

  const recentCharts = [
    { id: 1, name: 'Sales Trend', type: 'Line Chart', date: '2023-03-15' },
    { id: 2, name: 'Customer Distribution', type: 'Pie Chart', date: '2023-03-12' },
    { id: 3, name: 'Monthly Revenue', type: 'Bar Chart', date: '2023-03-10' },
  ];

  const stats = [
    { title: 'Total Files', value: '24', color: 'primary.main' },
    { title: 'Total Charts', value: '15', color: 'secondary.main' },
    { title: 'Storage Used', value: '2.5 GB', color: 'success.main' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to="/upload"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
          >
            Upload File
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/charts"
            startIcon={<AddIcon />}
          >
            Create Chart
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} md={4} key={stat.title}>
            <Item>
              <Typography variant="h6" gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="h4" sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
            </Item>
          </Grid>
        ))}
      </Grid>

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Recent Files" />
            <Tab label="Recent Charts" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <List>
              {recentFiles.map((file) => (
                <React.Fragment key={file.id}>
                  <ListItem>
                    <ListItemText
                      primary={file.name}
                      secondary={`Uploaded on ${file.date} | ${file.type}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="view">
                        <Visibility />
                      </IconButton>
                      <IconButton edge="end" aria-label="download">
                        <Download />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}

          {tabValue === 1 && (
            <List>
              {recentCharts.map((chart) => (
                <React.Fragment key={chart.id}>
                  <ListItem>
                    <ListItemText
                      primary={chart.name}
                      secondary={`Created on ${chart.date} | ${chart.type}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit">
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" aria-label="view">
                        <Visibility />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard; 