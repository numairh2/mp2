// OpenF1 API service layer
import axios from 'axios';
import { F1Driver, F1Session, F1Meeting, F1Lap, F1Position, F1Team } from '../types';

const BASE_URL = process.env.REACT_APP_OPENF1_BASE_URL || 'https://api.openf1.org/v1';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Get a consistent session key with all drivers having photos
export const getRecentSessionKey = async (): Promise<number> => {
  // Use Australian GP session which has all drivers with photos including Jack Doohan
  return 9693; // 2025 Australian GP race session
};

// Country code fallbacks for drivers when API returns null
const getCountryCodeFallback = (driverName: string): string => {
  const countryMap: Record<string, string> = {
    'VERSTAPPEN': 'NLD',
    'NORRIS': 'GBR',
    'HAMILTON': 'GBR',
    'RUSSELL': 'GBR',
    'LECLERC': 'MON',
    'SAINZ': 'ESP',
    'ALONSO': 'ESP',
    'PIASTRI': 'AUS',
    'GASLY': 'FRA',
    'OCON': 'FRA',
    'TSUNODA': 'JPN',
    'ALBON': 'THA',
    'STROLL': 'CAN',
    'HULKENBERG': 'DEU',
    'BEARMAN': 'GBR',
    'ANTONELLI': 'ITA',
    'COLAPINTO': 'ARG',
    'BORTOLETO': 'BRA',
    'HADJAR': 'FRA',
    'LAWSON': 'NZL'
  };
  
  const lastName = driverName.split(' ').pop()?.toUpperCase() || '';
  return countryMap[lastName] || 'INT'; // INT for International
};

// Fetch all drivers from recent sessions
export const fetchDrivers = async (): Promise<F1Driver[]> => {
  try {
    const sessionKey = await getRecentSessionKey();
    const response = await api.get('/drivers', {
      params: {
        session_key: sessionKey
      }
    });
    
    const drivers: F1Driver[] = response.data;
    
    // Fill in missing country codes
    const driversWithCountries = drivers.map(driver => ({
      ...driver,
      country_code: driver.country_code || getCountryCodeFallback(driver.full_name)
    }));
    
    return driversWithCountries;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw new Error('Failed to fetch F1 drivers data');
  }
};

// Fetch driver by driver number
export const fetchDriverById = async (driverNumber: number): Promise<F1Driver | null> => {
  try {
    const drivers = await fetchDrivers();
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver || null;
  } catch (error) {
    console.error('Error fetching driver by ID:', error);
    return null;
  }
};

// Fetch teams by aggregating driver data
export const fetchTeams = async (): Promise<F1Team[]> => {
  try {
    const drivers = await fetchDrivers();
    const teamsMap = new Map<string, F1Team>();
    
    drivers.forEach(driver => {
      const teamName = driver.team_name || 'Unknown Team';
      
      if (!teamsMap.has(teamName)) {
        teamsMap.set(teamName, {
          team_name: teamName,
          team_colour: driver.team_colour,
          drivers: [],
          country_codes: []
        });
      }
      
      const team = teamsMap.get(teamName)!;
      team.drivers.push(driver);
      
      const countryCode = driver.country_code || 'INT';
      if (!team.country_codes.includes(countryCode)) {
        team.country_codes.push(countryCode);
      }
    });
    
    return Array.from(teamsMap.values());
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw new Error('Failed to fetch F1 teams data');
  }
};

// Fetch lap data for a specific driver
export const fetchDriverLaps = async (driverNumber: number, limit: number = 10): Promise<F1Lap[]> => {
  try {
    const sessionKey = await getRecentSessionKey();
    const response = await api.get('/laps', {
      params: {
        driver_number: driverNumber,
        session_key: sessionKey
      }
    });
    
    const laps: F1Lap[] = response.data;
    
    // Return the most recent laps (limited)
    return laps
      .sort((a, b) => b.lap_number - a.lap_number)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching driver laps:', error);
    return [];
  }
};

// Fetch recent sessions
export const fetchRecentSessions = async (limit: number = 5): Promise<F1Session[]> => {
  try {
    const response = await api.get('/sessions', {
      params: {
        year: 2025
      }
    });
    
    const sessions: F1Session[] = response.data;
    
    return sessions
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }
};

// Fetch meetings (Grand Prix events)
export const fetchMeetings = async (year: number = 2025): Promise<F1Meeting[]> => {
  try {
    const response = await api.get('/meetings', {
      params: { year }
    });
    
    return response.data as F1Meeting[];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
};

// Fetch positions for a specific session
export const fetchPositions = async (sessionKey: number): Promise<F1Position[]> => {
  try {
    const response = await api.get('/position', {
      params: {
        session_key: sessionKey
      }
    });
    
    return response.data as F1Position[];
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
};

// Get driver navigation data (for previous/next functionality)
export const getDriverNavigation = async (currentDriverNumber: number): Promise<{
  previous: F1Driver | null;
  next: F1Driver | null;
}> => {
  try {
    const drivers = await fetchDrivers();
    const sortedDrivers = drivers.sort((a, b) => a.driver_number - b.driver_number);
    
    const currentIndex = sortedDrivers.findIndex(d => d.driver_number === currentDriverNumber);
    
    return {
      previous: currentIndex > 0 ? sortedDrivers[currentIndex - 1] : null,
      next: currentIndex < sortedDrivers.length - 1 ? sortedDrivers[currentIndex + 1] : null
    };
  } catch (error) {
    console.error('Error getting driver navigation:', error);
    return { previous: null, next: null };
  }
};

// Fetch session results (standings after a session)
export const fetchSessionResults = async (sessionKey?: number): Promise<any[]> => {
  try {
    const currentSessionKey = sessionKey || await getRecentSessionKey();
    const response = await api.get('/session_result', {
      params: {
        session_key: currentSessionKey
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching session results:', error);
    return [];
  }
};

