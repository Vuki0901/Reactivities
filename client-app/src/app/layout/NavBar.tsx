import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Container, Menu } from "semantic-ui-react";

export default function NavBar() {
    return (
        <Menu>
            <Container>
                <Menu.Item as={NavLink} to="/" exact>
                    <img src="/assets/logo.png" alt="logo"/>
                    Reactivites
                </Menu.Item>
                <Menu.Item as={NavLink} to="/activities" name="Activities"/>
                <Menu.Item>
                    <Button as={NavLink} to="/createActivity" positive content="Create Activity"/>
                </Menu.Item>
            </Container>
        </Menu>
    )
}