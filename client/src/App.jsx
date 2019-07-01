import ApolloClient from 'apollo-boost';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Grid, Header } from 'semantic-ui-react';
import Movies from './Movies';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Grid celled>
        <Grid.Column width={12} as="header">
          <Header as="h1">GraphQL Playground</Header>
        </Grid.Column>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Movies />
          </Grid.Column>
          <Grid.Column>
            <Header>Users</Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </ApolloProvider>
  );
}

export default App;
