import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { Activity } from '../models/Activity';
import NavBar from './NavBar';
import {v4 as uuid} from "uuid";
import agent from "../api/agent";
import LoadingComponent from './LoadingComponent';



function App() {

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const[editMode, setEditMode] = useState<boolean>(false);
  const[loading, setLoading] = useState(true);
  const[submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    agent.Activities.list().then(res => {
      let activities: Activity[] = [];
      res.forEach((a: Activity) => {
        a.date = a.date.split("T")[0];
        activities.push(a);
      })
      setActivities(activities);
      setLoading(false);
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
    if (activity.id) {
      agent.Activities.update(activity).then(() => {
        setActivities([...activities.filter(x => x.id !== activity.id), activity])
        setEditMode(false);
        setSelectedActivity(activity);
        setSubmitting(false);
      }) } else {
        activity.id = uuid();
        agent.Activities.create(activity).then(() => {
          setActivities([...activities, activity])
          setEditMode(false);
          setSelectedActivity(activity);
          setSubmitting(false);  
        })
      }
    }

  const handleDeleteActivity = (id: string) => {
    setSubmitting(true);
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(x => x.id !== id)])
      setSubmitting(false);
    })
  }

  return loading ? 
  <LoadingComponent content="Loading..."/> :
  (
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
          deleteActivity={handleDeleteActivity}
          submitting={submitting}/>
      </Container>
      
    </>
  );
}

export default App;
