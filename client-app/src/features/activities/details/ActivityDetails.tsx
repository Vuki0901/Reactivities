import React from "react";
import { Button, Card, Image } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default function ActivityDetails() {
    const {activityStore} = useStore();
    const {selectedActivity: activity, openForm, cancelSelectActivity} = activityStore;

    return (!activity) ? null : (
        <Card fluid>
            <Image src={`/assets/categoryImages/${activity.category}.jpg`} />
            <Card.Content>
            <Card.Header>{activity.title}</Card.Header>
            <Card.Meta>
                <span className='date'>{activity.date}</span>
            </Card.Meta>
            <Card.Description>
                {activity.description}
            </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Button.Group widths="2">
                    <Button onClick={() => openForm(activity.id)} basic color="blue" content="Edit"/>
                    <Button onClick={cancelSelectActivity} basic color="grey" content="Cancel"/>
                </Button.Group>
            </Card.Content>
        </Card>
    )
}