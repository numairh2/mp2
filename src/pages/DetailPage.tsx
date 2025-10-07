import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { F1Driver, F1Lap } from '../types';
import { fetchDriverById, fetchDriverLaps, getDriverNavigation } from '../services/api';
import '../styles/DetailPage.css';

const DetailPage: React.FC = () => {
  const { driverNumber } = useParams<{ driverNumber: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<F1Driver | null>(null);
  const [laps, setLaps] = useState<F1Lap[]>([]);
  const [navigation, setNavigation] = useState<{
    previous: F1Driver | null;
    next: F1Driver | null;
  }>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (driverNumber) {
      loadDriverData(parseInt(driverNumber));
    }
  }, [driverNumber]);

  const loadDriverData = async (driverNum: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading driver data for number: ${driverNum}`);
      
      // Load driver info, laps, and navigation in parallel
      const [driverData, lapsData, navData] = await Promise.all([
        fetchDriverById(driverNum),
        fetchDriverLaps(driverNum),
        getDriverNavigation(driverNum)
      ]);

      if (!driverData) {
        setError(`Driver with number ${driverNum} not found.`);
        return;
      }

      setDriver(driverData);
      setLaps(lapsData);
      setNavigation(navData);
    } catch (error) {
      console.error('Error loading driver data:', error);
      setError('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePreviousDriver = () => {
    if (navigation.previous) {
      navigate(`/driver/${navigation.previous.driver_number}`);
    }
  };

  const handleNextDriver = () => {
    if (navigation.next) {
      navigate(`/driver/${navigation.next.driver_number}`);
    }
  };

  const formatLapTime = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const formatSpeed = (speed?: number) => {
    return speed ? `${speed.toFixed(1)} km/h` : 'N/A';
  };

  if (loading) {
    return (
      <div className="loading" style={{textAlign: 'center', padding: '40px'}}>
        <div style={{fontSize: '18px', marginBottom: '10px'}}>Loading driver details...</div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="error" style={{textAlign: 'center', padding: '40px'}}>
        <h1 style={{color: '#d32f2f', marginBottom: '16px'}}>⚠️ Error</h1>
        <p style={{marginBottom: '20px', color: '#666'}}>{error || 'Driver not found'}</p>
        <div>
          <button 
            onClick={handleBackClick}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Go Back
          </button>
          {driverNumber && (
            <button 
              onClick={() => loadDriverData(parseInt(driverNumber))}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page" style={{maxWidth: '1000px', margin: '0 auto', padding: '20px'}}>
      {/* Navigation Controls */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <button 
          onClick={handleBackClick} 
          className="back-button"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back to List
        </button>

        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            onClick={handlePreviousDriver}
            disabled={!navigation.previous}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              backgroundColor: navigation.previous ? '#3b82f6' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: navigation.previous ? 'pointer' : 'not-allowed'
            }}
            title={navigation.previous ? `Previous: ${navigation.previous.broadcast_name}` : 'No previous driver'}
          >
            ← Previous
          </button>
          <button 
            onClick={handleNextDriver}
            disabled={!navigation.next}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              backgroundColor: navigation.next ? '#3b82f6' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: navigation.next ? 'pointer' : 'not-allowed'
            }}
            title={navigation.next ? `Next: ${navigation.next.broadcast_name}` : 'No next driver'}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Driver Header */}
      <div className="driver-header" style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Team Color Bar */}
        {driver.team_colour && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              backgroundColor: driver.team_colour
            }}
          />
        )}

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px'}}>
          <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', flex: 1}}>
            {/* Driver Photo */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `3px solid ${driver.team_colour || '#ddd'}`,
              flexShrink: 0,
              background: 'rgba(0,0,0,0.05)'
            }}>
              <img 
                src={driver.headshot_url || ''} 
                alt={driver.full_name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 35%'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjBmMGYwIi8+CjxzdmcgeD0iMzAiIHk9IjMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5OTk5OSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkMyMSAyMi42IDIwLjYgMjMgMjAgMjNIMTlMMTguNSAyMC4zMkMxOC4xIDIwLjc1IDE3LjYgMjEgMTcgMjFIMTNDMTAuMiAyMSA4IDE4LjggOCAxNlY5QzggOC40IDguNCA4IDkgOEgxNUMxNS42IDggMTYgOC40IDE2IDlIMjBDMjAuNiA5IDIxIDkuNCAyMSA5WiIvPgo8L3N2Zz4KPC9zdmc+';
                }}
              />
            </div>
            
            {/* Driver Info */}
            <div style={{flex: 1}}>
              <h1 style={{margin: '0 0 10px 0', fontSize: '32px', color: '#333'}}>
                {driver.broadcast_name}
              </h1>
              <p style={{margin: '0 0 15px 0', fontSize: '18px', color: '#666'}}>
                {driver.full_name}
              </p>
              <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                <span style={{
                  backgroundColor: '#f0f0f0',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#555'
                }}>
                  🏁 {driver.team_name || 'Unknown Team'}
                </span>
              <span style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🌍 {driver.country_code}
              </span>
            </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: driver.team_colour || '#333',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <div style={{fontSize: '12px', opacity: 0.8, marginBottom: '5px'}}>DRIVER</div>
            <div style={{fontSize: '32px', fontWeight: 'bold'}}>#{driver.driver_number}</div>
          </div>
        </div>
      </div>

      {/* Driver Details */}
      <div className="driver-details" style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{marginBottom: '25px', fontSize: '24px'}}>Driver Information</h2>
        <div className="details-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div className="detail-item" style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <label style={{fontWeight: 'bold', color: '#555', fontSize: '14px', display: 'block', marginBottom: '5px'}}>
              Full Name
            </label>
            <span style={{fontSize: '16px'}}>{driver.full_name}</span>
          </div>
          
          <div className="detail-item" style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <label style={{fontWeight: 'bold', color: '#555', fontSize: '14px', display: 'block', marginBottom: '5px'}}>
              Broadcast Name
            </label>
            <span style={{fontSize: '16px'}}>{driver.broadcast_name}</span>
          </div>

          <div className="detail-item" style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <label style={{fontWeight: 'bold', color: '#555', fontSize: '14px', display: 'block', marginBottom: '5px'}}>
              Name Acronym
            </label>
            <span style={{fontSize: '16px'}}>{driver.name_acronym}</span>
          </div>

          <div className="detail-item" style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <label style={{fontWeight: 'bold', color: '#555', fontSize: '14px', display: 'block', marginBottom: '5px'}}>
              Team
            </label>
            <span style={{fontSize: '16px'}}>{driver.team_name || 'Unknown'}</span>
          </div>

          <div className="detail-item" style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <label style={{fontWeight: 'bold', color: '#555', fontSize: '14px', display: 'block', marginBottom: '5px'}}>
              Country
            </label>
            <span style={{fontSize: '16px'}}>{driver.country_code}</span>
          </div>

          <div className="detail-item" style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <label style={{fontWeight: 'bold', color: '#555', fontSize: '14px', display: 'block', marginBottom: '5px'}}>
              Driver Number
            </label>
            <span style={{fontSize: '16px'}}>#{driver.driver_number}</span>
          </div>
        </div>
      </div>

      {/* Recent Lap Performance */}
      {laps.length > 0 && (
        <div className="lap-performance" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{marginBottom: '25px', fontSize: '24px'}}>Recent Lap Performance</h2>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Lap #</th>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Lap Time</th>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Sector 1</th>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Sector 2</th>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Sector 3</th>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Speed (I1)</th>
                  <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Pit Out</th>
                </tr>
              </thead>
              <tbody>
                {laps.slice(0, 10).map((lap, index) => (
                  <tr key={index} style={{borderBottom: '1px solid #dee2e6'}}>
                    <td style={{padding: '12px', fontWeight: 'bold'}}>{lap.lap_number}</td>
                    <td style={{padding: '12px'}}>{formatLapTime(lap.lap_duration)}</td>
                    <td style={{padding: '12px'}}>{formatLapTime(lap.duration_sector_1)}</td>
                    <td style={{padding: '12px'}}>{formatLapTime(lap.duration_sector_2)}</td>
                    <td style={{padding: '12px'}}>{formatLapTime(lap.duration_sector_3)}</td>
                    <td style={{padding: '12px'}}>{formatSpeed(lap.i1_speed)}</td>
                    <td style={{padding: '12px'}}>
                      {lap.is_pit_out_lap ? 
                        <span style={{color: '#f57c00', fontWeight: 'bold'}}>Yes</span> : 
                        <span style={{color: '#4caf50'}}>No</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {laps.length > 10 && (
            <div style={{marginTop: '15px', textAlign: 'center', color: '#666', fontSize: '14px'}}>
              Showing latest 10 laps of {laps.length} total laps
            </div>
          )}
        </div>
      )}

      {laps.length === 0 && (
        <div className="no-laps" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          color: '#666'
        }}>
          <h3>No Recent Lap Data Available</h3>
          <p>Lap performance data for this driver is not available for the current session.</p>
        </div>
      )}
    </div>
  );
};

export default DetailPage;