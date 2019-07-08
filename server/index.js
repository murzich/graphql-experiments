const { ApolloServer, gql } = require('apollo-server');

const { MongoClient } = require('mongodb');
require('dotenv').config();

const fetch = require('isomorphic-fetch')
const { GraphQLTypeDate } = require('./scalars')

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TOKEN_ENDPOINT = 'https://www.googleapis.com/oauth2/v4/token';

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

  type AuthData {
    _id: ID!
    token: String!
    email: String!
  }

  type Mutation {
    oAuthGoogle(code: String!): AuthData
  }
`;

const fetchGoolgeCredentials = async (code) => {
  console.log(code);
  return Promise.resolve({
    code,
    id: 'some id',
    email: 'test@example.com',
    token: 'sometoken',
  });
}

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
  Mutation: {
    async oAuthGoogle(parent, { code }, { db }) {
      const credentials = {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000',
        grant_type: 'authorization_code',
      }
      console.log(credentials);

      const data = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(credentials),
      })
        .catch(e => {
          console.warn('warn', e);
          throw e;
        });
      console.log('token', data);

      let authData = await fetchGoolgeCredentials(code, CLIENT_ID, CLIENT_SECRET);
      return {
        _id: authData.id,
        token: authData.token,
        email: authData.email,
      }
    }
  }
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
