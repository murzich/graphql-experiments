import ApolloClient from 'apollo-boost';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Container, Grid, Header } from 'semantic-ui-react';
import Login from './Login';
import Movies from './Movies';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Container>
        <Grid>
          <Grid.Row as="header">
            <Grid.Column width={12}>
              <Header as="h1">GraphQL Playground</Header>
            </Grid.Column>
            <Grid.Column width={4}>
              <Login />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Movies />
            </Grid.Column>
            <Grid.Column>
              <Header>Users</Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </ApolloProvider>
  );
}

export default App;
