import { observer } from 'mobx-react-lite';
import React from 'react';
import { Route, useLocation } from 'react-router';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import ActivityForm from '../../features/activities/form/ActivityForm';
import HomePage from '../../features/home/homePage';
import NavBar from './NavBar';



function App() {
  const location = useLocation();

  return(
    <>
      <Route exact path="/" component={HomePage}/>
      <Route 
        path={"/(.+)"}
        render={() => (
          <>
          <NavBar/>
          <Container>
            <Route exact path="/activities" component={ActivityDashboard}/>
            <Route path="/activities/:id" component={ActivityDetails}/>
            <Route key={location.key} path={["/createActivity", "/manage/:id"]} component={ActivityForm}/>
          </Container>
          </>
        )}
      />
      
    </>
  );
}

export default observer(App);