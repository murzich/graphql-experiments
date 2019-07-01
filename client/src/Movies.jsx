import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';
import { Dimmer, Header, Item, Label, Loader, Message, Placeholder, Segment } from 'semantic-ui-react';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/150';

function Movies() {
  return (
    <>
      <Query
        query={gql`
          {
            moviesCount
            movies(year: 1963) {
              _id
              title
              poster
              runtime
            }
          }
        `}
      >
        {({ data, loading, error }) => {
          if (error) {
            return (
              <Message error>
                <Message.Header>Something went wrong...</Message.Header>
                <Message.Content>{error.message}</Message.Content>
              </Message>
            );
          }

          return (
            <>
              <Header as="h2">
                Movies
                {data && <Label>{data.moviesCount}</Label>}
              </Header>
              <Segment>
                <Dimmer active={loading}>
                  <Loader>Loading</Loader>
                </Dimmer>

                <Item.Group>
                  {data && data.movies ? (
                    data.movies.map(({ _id: id, title, runtime, poster }) => (
                      <Item key={id}>
                        <Item.Image
                          size="tiny"
                          src={poster || PLACEHOLDER_IMG}
                        />
                        <Item.Content>
                          <Item.Header>{title}</Item.Header>
                          <Item.Description>
                            duration: {runtime} min
                          </Item.Description>
                        </Item.Content>
                      </Item>
                    ))
                  ) : (
                    <Item>
                      <Placeholder>
                        <Placeholder.Image />
                      </Placeholder>
                      <Item.Content>
                        <Placeholder.Header>
                          <Placeholder.Line />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                          <Placeholder.Line size="tiny" />
                        </Placeholder.Paragraph>
                      </Item.Content>
                    </Item>
                  )}
                </Item.Group>
              </Segment>
            </>
          );
        }}
      </Query>
    </>
  );
}

export default Movies;
