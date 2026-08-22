import React, { useContext } from 'react';
import { Container, Card, CardContent, Typography, Box, Grid, Avatar } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card sx={{ boxShadow: 4, borderRadius: 3, p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              backgroundColor: '#1e293b', 
              color: '#ffffff',
              mb: 2,
              boxShadow: 2
            }}>
              {getInitials(user.name)}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              {user.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mt: 0.5, fontWeight: 'bold' }}
            >
              Account Role: {user.role}
            </Typography>
          </Box>

          <Box sx={{ borderTop: '1px solid #e2e8f0', pt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                  Email Address:
                </Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Typography variant="body1" sx={{ color: '#1e293b' }}>
                  {user.email}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                  Phone Number:
                </Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Typography variant="body1" sx={{ color: '#1e293b' }}>
                  {user.phone || 'Not Provided'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                  User ID:
                </Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Typography variant="body2" sx={{ color: '#475569', fontFamily: 'monospace' }}>
                  {user.id}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
