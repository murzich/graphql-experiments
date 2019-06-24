const { ApolloServer, gql } = require('apollo-server');

const { MongoClient } = require('mongodb');
require('dotenv').config();

const typeDefs = gql`
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
    released: Int
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

  type Query {
    moviesCount: Int!
    usersCount: Int!
    dbName: String
    users(name: String): [User]!
    movies(title: String, _id: ID, year: Int): [Movie]!
  }
`;

const resolvers = {
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
    movies: (parent, args, { db }) =>
      db
        .collection('movies')
        .find({ ...args })
        .toArray(),
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
