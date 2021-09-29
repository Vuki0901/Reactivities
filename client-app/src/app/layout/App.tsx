import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
import NavBar from './NavBar';



function App() {
  const {activityStore} = useStore();
  
  useEffect(() => {
    activityStore.loadActivities()
  }, [activityStore])
  
  return activityStore.loadingInitial ? 
  <LoadingComponent content="Loading..."/> :
  (
    <>
      <NavBar/>
      <Container>
        <ActivityDashboard/>
      </Container>
      
    </>
  );
}

export default observer(App);