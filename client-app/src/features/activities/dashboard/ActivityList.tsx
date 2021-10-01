import { observer } from "mobx-react-lite";
import React, { SyntheticEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Item, Label, Segment } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default observer(function ActivityList () {
    const[target, setTarget] = useState("");

    const {activityStore} = useStore();
    const {deleteActivity, loading, ActivitiesByDate} = activityStore;

    const handleActivtiyDelete = (e: SyntheticEvent<HTMLButtonElement>, id: string) => {
        setTarget(e.currentTarget.name);
        deleteActivity(id);
    }

    return (
        <Segment>
            <Item.Group divided>
                {ActivitiesByDate.map(activity => {
                    return(
                        <Item key={activity.id}>
                            <Item.Content>
                                <Item.Header as="a">{activity.title}</Item.Header>
                                <Item.Meta>{activity.date}</Item.Meta>
                                <Item.Description>
                                    <div>
                                        {activity.description}
                                    </div>
                                    <div>
                                        {activity.city}, {activity.venue}
                                    </div>
                                    <Item.Extra>
                                        <Button as={Link} to={`activities/${activity.id}`} floated="right" content="View" color="blue"/>
                                        <Button 
                                            name={activity.id}
                                            loading={loading && target === activity.id} 
                                            onClick={(e) => handleActivtiyDelete(e, activity.id)} 
                                            floated="right" 
                                            content="Delete" 
                                            color="red"/>
                                        <Label basic content={activity.category}/>
                                    </Item.Extra>
                                </Item.Description>
                            </Item.Content>
                        </Item>
                    )
                })}
            </Item.Group>
        </Segment>
    )
})