const { ApolloServer, gql } = require('apollo-server');

const { MongoClient } = require('mongodb');
require('dotenv').config();

const { GraphQLTypeDate } = require('./scalars')

const typeDefs = gql`
  scalar Date

  type User {
    _id: String!
    name: String!
    email: String!
    password: String!
  }

  type Awards {
    wins: Int
    nominations: Int
    text: String
  }

  type Critic {
    rating: Float
    numReviews: Int
    meter: Int
  }

  type Viewer {
    rating: Float
    numReviews: Int
    meter: Int
  }

  type Tomatoes {
    dvd: Int
    lastUpdated: Int
    consensus: String
    rotten: Int
    production: String
    fresh: Int
    critic: Critic
    viewer: Viewer
  }

  type Imdb {
    rating: String
    votes: Int
    id: Int!
  }

  type Movie {
    _id: ID!
    fullplot: String
    year: Int
    plot: String
    rated: String
    metacritic: Int
    title: String
    lastupdated: String
    type: String
    poster: String
    num_mflix_comments: Int
    released: Date
    runtime: Int
    directors: [String]
    cast: [String]
    countries: [String]
    awards: Awards
    tomatoes: Tomatoes
    writers: [String]
    languages: [String]
    genres: [String]
    imdb: Imdb
  }

  type MovieResponse {
    movies: [Movie]!
    count: Int!
  }

  input MovieFilters {
    _id: ID
    title: String
    year: Int
  }

  input MovieSort {
    year: Int
    title: Int
    released: Int
    runtime: Int
  }

  input Pagination {
    limit: Int
    offset: Int
  }

  type Query {
    moviesCount: Int!
    usersCount: Int!
    dbName: String
    users(name: String): [User]!
    movies(filters: MovieFilters, page: Pagination, sort: MovieSort): MovieResponse
  }
`;

const resolvers = {
  Date: GraphQLTypeDate,
  Query: {
    moviesCount: (parent, args, { db }) =>
      db.collection('movies').estimatedDocumentCount(),
    usersCount: (parent, args, { db }) =>
      db.collection('users').estimatedDocumentCount(),
    dbName: (parent, args, { db }) => db.getName,
    users: (parent, args, { db }) =>
      db
        .collection('users')
        .find({ ...args })
        .toArray(),
    movies: (
      parent,
      {
        filters,
        sort = {},
        page: { offset = 0, limit = 20 } = {},
      },
      { db }
    ) => {
      // support only one field for sorting for now
      if (Object.keys(sort).length > 1) {
        throw new Error('Sort must contain only one field');
      }

      const currentYear = new Date().getFullYear();
      const year = (filters.year > 1877 && filters.year <= currentYear)
        ? filters.year
        : undefined;
      const title = new RegExp(filters.title, 'i');

      const moviesArrayCursor = db
        .collection('movies')
        .find({ ...filters, title, year });

      const count = moviesArrayCursor.count();
      const movies = moviesArrayCursor
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray();

      return {
        movies,
        count,
      };
    },
  },
};

async function start() {
  const MONGO_DB = process.env.DB_HOST;
  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });

  const db = client.db('sample_mflix');
  const context = { db };

  const server = new ApolloServer({ typeDefs, resolvers, context });

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

start();
