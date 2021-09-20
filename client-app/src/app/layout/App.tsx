import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { Activity } from '../models/Activity';
import NavBar from './NavBar';
import {v4 as uuid} from "uuid";



function App() {

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const[editMode, setEditMode] = useState<boolean>(false);
  
  useEffect(() => {
    axios.get<Activity[]>("http://localhost:5000/api/activities").then(res => {
      setActivities(res.data);
    })
  }, [])

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.find(x => id === x.id))
  }

  const handleCancelSelectActivity = () => {
    setSelectedActivity(undefined)
  }

  const handleFormOpen = (id?: string) => {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  const handleFormClose = () => {
    setEditMode(false);
  }

  const handleCreateOrEditActivity = (activity: Activity) => {
    activity.id ? 
    setActivities([...activities.filter(x => x.id !== activity.id), activity]) :
    setActivities([...activities, {...activity, id: uuid()}])
    setEditMode(false);
    setSelectedActivity(activity);
  }

  const handleDeleteActivity = (id: string) => {
    setActivities([...activities.filter(x => x.id !== id)])
  }

  return (
    <>
      <NavBar openForm={handleFormOpen}/>
      <Container>
        <ActivityDashboard 
          activities={activities}
          selectedActivity={selectedActivity}
          setSelectActivity={handleSelectActivity}
          cancelSelectActivity={handleCancelSelectActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEdit={handleCreateOrEditActivity}
          deleteActivity={handleDeleteActivity}/>
      </Container>
      
    </>
  );
}

export default App;
