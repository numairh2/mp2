import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { F1Driver, DriverSortOption, SortConfig } from '../types';
import { fetchDrivers } from '../services/api';
import '../styles/ListPage.css';

const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<F1Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    option: 'name',
    order: 'asc'
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const driversData = await fetchDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading drivers:', error);
      setError('Failed to load F1 drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique teams and countries for filters
  const { teams, countries } = useMemo(() => {
    const teamSet = new Set(drivers.map(d => d.team_name).filter(Boolean));
    const countrySet = new Set(drivers.map(d => d.country_code || 'INT').filter(Boolean));
    const uniqueTeams = Array.from(teamSet).sort();
    const uniqueCountries = Array.from(countrySet).sort();
    return { teams: uniqueTeams, countries: uniqueCountries };
  }, [drivers]);

  // Filter and sort drivers
  const filteredAndSortedDrivers = useMemo(() => {
    let filtered = drivers.filter(driver => {
      const matchesSearch = 
        driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.broadcast_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (driver.team_name && driver.team_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTeam = !selectedTeam || driver.team_name === selectedTeam;
      const matchesCountry = !selectedCountry || (driver.country_code || 'INT') === selectedCountry;
      
      return matchesSearch && matchesTeam && matchesCountry;
    });

    // Sort drivers
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.option) {
        case 'name':
          aValue = a.full_name;
          bValue = b.full_name;
          break;
        case 'team':
          aValue = a.team_name || '';
          bValue = b.team_name || '';
          break;
        case 'driver_number':
          aValue = a.driver_number;
          bValue = b.driver_number;
          break;
        case 'country':
          aValue = a.country_code || 'ZZZ'; // Put null values at the end
          bValue = b.country_code || 'ZZZ';
          break;
        default:
          aValue = a.full_name;
          bValue = b.full_name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.order === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortConfig.order === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [drivers, searchQuery, selectedTeam, selectedCountry, sortConfig]);

  const handleDriverClick = (driverNumber: number) => {
    navigate(`/driver/${driverNumber}`);
  };

  const handleSort = (option: DriverSortOption) => {
    setSortConfig(prev => ({
      option,
      order: prev.option === option && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (option: DriverSortOption) => {
    if (sortConfig.option !== option) return '↕️';
    return sortConfig.order === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="loading">
        Loading F1 drivers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h1>⚠️ Error</h1>
        <p>{error}</p>
        <button onClick={loadDrivers}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="list-page">
      <h1>🏎️ F1 Drivers</h1>
      
      {/* Search and Filter Controls */}
      <div className="controls">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search drivers, teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filters */}
        <div>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Sort Buttons */}
        <div>
          {(['name', 'team', 'driver_number', 'country'] as DriverSortOption[]).map(option => (
            <button
              key={option}
              onClick={() => handleSort(option)}
              style={{backgroundColor: sortConfig.option === option ? 'rgb(59, 130, 246)' : ''}}
            >
              {option.replace('_', ' ').toUpperCase()} {getSortIcon(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="info-section">
        <p>
          Showing {filteredAndSortedDrivers.length} of {drivers.length} drivers
        </p>
      </div>
      
      {/* Drivers Grid */}
      <div className="drivers-grid">
        {filteredAndSortedDrivers.map(driver => (
          <div 
            key={`${driver.driver_number}-${driver.session_key}`}
            className="driver-card" 
            onClick={() => handleDriverClick(driver.driver_number)}
          >
            <div>
              <div>
                <h3>{driver.broadcast_name}</h3>
                <p>{driver.full_name}</p>
              </div>
              <div style={{backgroundColor: driver.team_colour}}>
                #{driver.driver_number}
              </div>
            </div>
            
            <div>
              <div>
                <strong>Team:</strong> {driver.team_name || 'Unknown'}
              </div>
              <div>
                <strong>Country:</strong> {driver.country_code || 'INT'}
              </div>
              <div>
                Click to view details
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedDrivers.length === 0 && !loading && (
        <div className="no-results">
          No drivers found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default ListPage;