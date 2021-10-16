import { observer } from 'mobx-react-lite';
import React from 'react';
import { Route, Switch, useLocation } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Container } from 'semantic-ui-react';
import NotFound from '../../errors/NotFound';
import ServerError from '../../errors/ServerError';
import TestErrors from '../../errors/TestError';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import ActivityForm from '../../features/activities/form/ActivityForm';
import HomePage from '../../features/home/homePage';
import NavBar from './NavBar';



function App() {
  const location = useLocation();

  return(
    <>
      <ToastContainer position='bottom-right' hideProgressBar/>
      <Route exact path="/" component={HomePage}/>
      <Route 
        path={"/(.+)"}
        render={() => (
          <>
          <NavBar/>
          <Container>
            <Switch>
              <Route exact path="/activities" component={ActivityDashboard}/>
              <Route path="/activities/:id" component={ActivityDetails}/>
              <Route key={location.key} path={["/createActivity", "/manage/:id"]} component={ActivityForm}/>
              <Route path="/errors" component={TestErrors}/>
              <Route path="/server-error" component={ServerError}/>
              <Route component={NotFound}/>
            </Switch>
          </Container>
          </>
        )}
      />
      
    </>
  );
}

export default observer(App);