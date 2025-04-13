import React, { useState } from 'react';
import TeamsList from '../../components/teams/TeamsList';
import TeamForm from '../../components/teams/TeamForm';
import { Team } from '../../types/team';

const TeamsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>(undefined);

  const handleAddClick = () => {
    setCurrentTeam(undefined);
    setShowForm(true);
  };

  const handleEditClick = (team: Team) => {
    setCurrentTeam(team);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentTeam(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setCurrentTeam(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teams</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization's teams and their members.
        </p>
      </div>
      
      {showForm ? (
        <TeamForm 
          team={currentTeam} 
          onCancel={handleFormCancel} 
          onSuccess={handleFormSuccess} 
        />
      ) : (
        <TeamsList 
          onAdd={handleAddClick} 
          onEdit={handleEditClick} 
        />
      )}
    </div>
  );
};

export default TeamsPage;
