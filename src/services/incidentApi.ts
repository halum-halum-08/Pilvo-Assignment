import axios from 'axios';
import { 
  Incident, 
  CreateIncidentDto, 
  UpdateIncidentDto, 
  CreateIncidentUpdateDto 
} from '../models/incident';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Get all incidents
export const getIncidents = async (type?: string, includeUpdates: boolean = false) => {
  try {
    let url = '/incidents';
    const params = new URLSearchParams();
    
    if (type) {
      params.append('type', type);
    }
    
    if (includeUpdates) {
      params.append('includeUpdates', 'true');
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

// Get single incident by ID
export const getIncidentById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/incidents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching incident with ID ${id}:`, error);
    throw error;
  }
};

// Create a new incident
export const createIncident = async (incidentData: CreateIncidentDto) => {
  try {
    const response = await axiosInstance.post('/incidents', incidentData);
    return response.data;
  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
};

// Update an incident
export const updateIncident = async (id: string, incidentData: UpdateIncidentDto) => {
  try {
    const response = await axiosInstance.put(`/incidents/${id}`, incidentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating incident with ID ${id}:`, error);
    throw error;
  }
};

// Delete an incident
export const deleteIncident = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/incidents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting incident with ID ${id}:`, error);
    throw error;
  }
};

// Add an update to an incident
export const addIncidentUpdate = async (incidentId: string, updateData: CreateIncidentUpdateDto) => {
  try {
    const response = await axiosInstance.post(`/incidents/${incidentId}/updates`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error adding update to incident with ID ${incidentId}:`, error);
    throw error;
  }
};