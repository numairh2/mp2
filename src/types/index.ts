// F1 Racing App Type Definitions
// Based on OpenF1 API data structures

export interface F1Driver {
  broadcast_name: string;
  country_code: string | null;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url?: string | null;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour?: string;
  team_name?: string;
}

export interface F1Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
}

export interface F1Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_name: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

export interface F1Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
  i1_speed?: number;
  i2_speed?: number;
  is_pit_out_lap: boolean;
  lap_duration?: number;
  lap_number: number;
  meeting_key: number;
  segments_sector_1?: number[];
  segments_sector_2?: number[];
  segments_sector_3?: number[];
  session_key: number;
  st_speed?: number;
}

export interface F1Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

// Aggregated team interface for gallery view
export interface F1Team {
  team_name: string;
  team_colour?: string;
  drivers: F1Driver[];
  country_codes: string[];
}

// Component props interfaces
export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export interface FilterProps {
  selectedTeam: string;
  selectedCountry: string;
  onTeamChange: (team: string) => void;
  onCountryChange: (country: string) => void;
  teams: string[];
  countries: string[];
}

export interface DriverCardProps {
  driver: F1Driver;
  onClick: (driverNumber: number) => void;
}

export interface TeamCardProps {
  team: F1Team;
  onClick: (teamName: string) => void;
}

// Sort options for drivers
export type DriverSortOption = 'name' | 'team' | 'driver_number' | 'country';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  option: DriverSortOption;
  order: SortOrder;
}