import gql from 'graphql-tag';
import React, { useState } from 'react';
import { Query } from 'react-apollo';
import {
  Button,
  Dimmer,
  Header,
  Input,
  Item,
  Label,
  Loader,
  Message,
  Placeholder,
  Segment,
} from 'semantic-ui-react';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/150';

function Movies() {
  const [year, setYear] = useState(1963);

  function handleYearChange(event) {
    event.preventDefault();
    const { value } = event.target;

    const intValue = parseInt(value);
    const currentYear = new Date().getFullYear();
    if (intValue > 1877 && intValue <= currentYear) {
      setYear(intValue);
    }
  }

  return (
    <>
      <Query
        query={gql`
          query searchMovies($filters: MovieFilters, $page: Pagination) {
            movies(filters: $filters, page: $page) {
              count
              movies {
                _id
                title
                poster
                runtime
              }
            }
          }
        `}
        variables={{
          filters: {
            year,
          },
        }}
      >
        {({ data, loading, error, fetchMore }) => {
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
                {data && data.movies && <Label>{data.movies.count}</Label>}
                <Input
                  name="year"
                  onChange={handleYearChange}
                  placeholder="year"
                  defaultValue={year}
                />
              </Header>
              <Segment>
                <Dimmer active={loading}>
                  <Loader>Loading</Loader>
                </Dimmer>

                <Item.Group>
                  {data && data.movies ? (
                    <>
                      {data.movies.movies.map(
                        ({ _id: id, title, runtime, poster }) => (
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
                        ),
                      )}
                      <Button
                        disabled={data.movies.count <= data.movies.movies.length}
                        onClick={() =>
                          fetchMore({
                            variables: {
                              page: { offset: data.movies.movies.length },
                            },
                            updateQuery: (prev, { fetchMoreResult }) => {
                              if (!fetchMoreResult) return prev;
                              return {
                                ...prev,
                                movies: {
                                  ...prev.movies,
                                  movies: [
                                    ...prev.movies.movies,
                                    ...fetchMoreResult.movies.movies,
                                  ],
                                }
                              };
                            },
                          })
                        }
                      >
                        fetchMore
                      </Button>
                    </>
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
