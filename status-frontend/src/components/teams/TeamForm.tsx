import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { Team } from '../../types/team';

interface TeamFormProps {
  team?: Team;
  onCancel: () => void;
  onSuccess: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const TeamForm: React.FC<TeamFormProps> = ({ team, onCancel, onSuccess }) => {
  const [name, setName] = useState(team?.name || '');
  const [organization, setOrganization] = useState(team?.organization || '');
  const [loading, setLoading] = useState(false);

  const isEditing = !!team;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: 'Missing fields',
        description: 'Team name is required.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const data = { name, organization };
      
      if (isEditing) {
        await axios.put(`${API_URL}/teams/${team.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Success',
          description: 'Team updated successfully',
        });
      } else {
        await axios.post(`${API_URL}/teams`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Success',
          description: 'Team created successfully',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} team. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit' : 'Add'} Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Company or organization name"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Team' : 'Create Team'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TeamForm;
