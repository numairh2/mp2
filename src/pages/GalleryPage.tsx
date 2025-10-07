import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { F1Team } from '../types';
import { fetchTeams } from '../services/api';
import '../styles/GalleryPage.css';

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<F1Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minDrivers, setMinDrivers] = useState(0);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await fetchTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load F1 teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique countries for filter
  const countries = useMemo(() => {
    const allCountries = teams.flatMap(team => team.country_codes);
    const countrySet = new Set(allCountries);
    return Array.from(countrySet).sort();
  }, [teams]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.drivers.some(driver => 
          driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.broadcast_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesCountry = !selectedCountry || team.country_codes.includes(selectedCountry);
      const matchesDriverCount = team.drivers.length >= minDrivers;
      
      return matchesSearch && matchesCountry && matchesDriverCount;
    });
  }, [teams, searchQuery, selectedCountry, minDrivers]);

  const handleTeamClick = (teamName: string) => {
    // Navigate to the first driver of the team for detail view
    const team = teams.find(t => t.team_name === teamName);
    if (team && team.drivers.length > 0) {
      navigate(`/driver/${team.drivers[0].driver_number}`);
    }
  };

  const handleDriverClick = (driverNumber: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent team click
    navigate(`/driver/${driverNumber}`);
  };

  if (loading) {
    return (
      <div className="loading">
        Loading F1 teams...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={loadTeams}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <h1>🏁 F1 Teams Gallery</h1>
      
      {/* Filter Controls */}
      <div className="controls">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search teams or drivers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filters */}
        <div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <div>
            <label>Min Drivers:</label>
            <input
              type="range"
              min="0"
              max="5"
              value={minDrivers}
              onChange={(e) => setMinDrivers(Number(e.target.value))}
            />
            <span>{minDrivers}</span>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="info-section">
        <p>
          Showing {filteredTeams.length} of {teams.length} teams
        </p>
      </div>
      
      {/* Teams Grid */}
      <div className="teams-grid">
        {filteredTeams.map(team => (
          <div 
            key={team.team_name}
            className="team-card" 
            onClick={() => handleTeamClick(team.team_name)}
          >
            {/* Team Color Bar */}
            {team.team_colour && (
              <div style={{backgroundColor: team.team_colour}} />
            )}
            
            {/* Team Header */}
            <div>
              <h2>{team.team_name}</h2>
              <div>
                <span>
                  {team.drivers.length} driver{team.drivers.length !== 1 ? 's' : ''}
                </span>
                <div>
                  {team.country_codes.map(country => (
                    <span key={country}>
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Drivers List */}
            <div className="drivers-section">
              <h4>Drivers:</h4>
              <div className="drivers-list">
                {team.drivers.map(driver => (
                  <div 
                    key={driver.driver_number}
                    className="driver-item"
                    onClick={(e) => handleDriverClick(driver.driver_number, e)}
                  >
                    <div className="driver-photo-container">
                      <img 
                        src={driver.headshot_url || '/placeholder-driver.png'} 
                        alt={driver.full_name}
                        className="driver-photo"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5OTk5OSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkMyMSAyMi42IDIwLjYgMjMgMjAgMjNIMTlMMTguNSAyMC4zMkMxOC4xIDIwLjc1IDE3LjYgMjEgMTcgMjFIMTNDMTAuMiAyMSA4IDE4LjggOCAxNlY5QzggOC40IDguNCA4IDkgOEgxNUM0MS42IDggMTYgOC40IDE2IDlIMjBDMjAuNiA5IDIxIDkuNCAyMSA5WiIvPgo8L3N2Zz4KPC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="driver-info">
                      <div className="driver-name">
                        {driver.broadcast_name}
                      </div>
                      <div className="driver-country">
                        {driver.country_code || 'INT'}
                      </div>
                    </div>
                    <div className="driver-number" style={{backgroundColor: team.team_colour}}>
                      #{driver.driver_number}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Click instruction */}
            <div>
              Click team for first driver details • Click individual drivers for their details
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && !loading && (
        <div className="no-results">
          No teams found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default GalleryPage;