import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { Team } from '../../types/team';

interface TeamsListProps {
  onEdit: (team: Team) => void;
  onAdd: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const TeamsList: React.FC<TeamsListProps> = ({ onEdit, onAdd }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Could not load teams. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this team? All users will be removed from the team.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeams(teams.filter(team => team.id !== id));
      toast({
        title: 'Success',
        description: 'Team deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'Could not delete team. Make sure to remove all services first.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Teams</CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus size={16} className="mr-2" /> Add Team
        </Button>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No teams found. Create your first team to get started.
          </div>
        ) : (
          <div className="divide-y">
            {teams.map((team) => (
              <div key={team.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{team.name}</div>
                  {team.organization && (
                    <div className="text-sm text-muted-foreground mt-1">{team.organization}</div>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">
                    {team.users?.length || 0} members · {team.services?.length || 0} services
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(team)}>
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive" 
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamsList;
