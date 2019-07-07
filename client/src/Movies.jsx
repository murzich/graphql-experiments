import gql from 'graphql-tag';
import React, { useState } from 'react';
import { Query } from 'react-apollo';
import {
  Button,
  Checkbox,
  Dimmer,
  Form,
  Header,
  Input,
  Item,
  Label,
  Loader,
  Message,
  Placeholder,
  Segment,
  Select,
} from 'semantic-ui-react';
import debounce from 'lodash.debounce';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/150';

function Movies() {
  const [year, setYear] = useState(1963);

  const debounceSetYear = debounce(setYear, 500);

  function handleYearChange(event) {
    event.preventDefault();
    const { value } = event.target;

    const intValue = parseInt(value);
    const currentYear = new Date().getFullYear();
    if (intValue > 1877 && intValue <= currentYear) {
      debounceSetYear(intValue);
    }
  }

  const [title, setTitle] = useState();

  const debounceSetTitle = debounce(setTitle, 500);

  function handleTitleChange(event) {
    event.preventDefault();
    const { value } = event.target;

    debounceSetTitle(value);
  }

  const [sort, setSort] = useState({ year: 1 });

  function handleSortChange(event, { value }) {
    setSort({ [value]: Object.values(sort)[0] });
  }

  function handleSortDirectionChange() {
    setSort({ [Object.keys(sort)[0]]: Object.values(sort)[0] === 1 ? -1 : 1 });
  }

  return (
    <>
      <Query
        query={gql`
          query searchMovies(
            $filters: MovieFilters
            $page: Pagination
            $sort: MovieSort
          ) {
            movies(filters: $filters, page: $page, sort: $sort) {
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
            title,
          },
          sort,
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
              </Header>
              <Segment>
                <Header as="h3">Fiilters</Header>
                <Input
                  name="year"
                  type="number"
                  onChange={handleYearChange}
                  placeholder="year"
                  defaultValue={year}
                  label="Year"
                  size="mini"
                />
                <Input
                  name="title"
                  type="search"
                  onChange={handleTitleChange}
                  placeholder="Movie title"
                  label="Title"
                  size="mini"
                />
                <Form>
                  <Label>Sort by</Label>
                  <Select
                    additionLabel="Sort by"
                    name="sort"
                    placeholder="Choose sort"
                    options={[
                      { key: 'year', value: 'year', text: 'default' },
                      { key: 'released', value: 'released', text: 'released' },
                      { key: 'title', value: 'title', text: 'title' },
                    ]}
                    onChange={handleSortChange}
                    defaultValue={Object.keys(sort)[0]}
                    size="mini"
                  />
                  <Checkbox
                    label="Desc"
                    checked={Object.values(sort)[0] === -1 ? true : false}
                    onChange={handleSortDirectionChange}
                  />
                </Form>
              </Segment>
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
                        disabled={
                          data.movies.count <= data.movies.movies.length
                        }
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
                                },
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
