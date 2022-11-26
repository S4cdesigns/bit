export default `
  type Nationality {
    name: String!
    alpha2: String!
    nationality: String!
    alias: String
  }

  type ExternalLink {
    url: String
    text: String
  }

  input CustomFieldFilter {
    id: String!
    op: String!
    value: Json!
  }

  type Actor {
    _id: String!
    name: String!
    description: String
    aliases: [String!]!
    addedOn: Long!
    bornOn: Long
    favorite: Boolean!
    bookmark: Long
    rating: Int
    customFields: Object

    # Resolvers
    percentWatched: Float!
    score: Float!
    averageRating: Float!
    age: Int
    resolvedCustomFields: [CustomFieldEntry!]!
    availableFields: [CustomField!]!
    watches: [Long!]!
    labels: [Label!]!
    numScenes: Int!
    avatar: Image
    thumbnail: Image
    altThumbnail: Image
    hero: Image
    collabs: [Actor!]!
    nationality: Nationality
    externalLinks: [ExternalLink!]!
  }

  type ActorSearchResults {
    numItems: Int!
    numPages: Int!
    items: [Actor!]!
  }

  input ActorSearchQuery {
    query: String
    letter: String
    favorite: Boolean
    bookmark: Boolean
    rating: Int
    include: [String!]
    exclude: [String!]
    nationality: String
    sortBy: String
    sortDir: String
    skip: Int
    take: Int
    page: Int
    studios: [String!]
    custom: [CustomFieldFilter!]

    rawQuery: Json
  }

  extend type Query {
    numActors: Int!
    getActors(query: ActorSearchQuery!, seed: String): ActorSearchResults!
    getActorById(id: String!): Actor
    topActors(skip: Int, take: Int): [Actor!]!
    getUnwatchedActors(skip: Int, take: Int): [Actor!]!

    getActorsWithoutScenes(num: Int): [Actor!]!
    getActorsWithoutLabels(num: Int): [Actor!]!
  }

  input ExternalLinkUpdateOpts {
    url: String
    text: String
  }

  input ActorUpdateOpts {
    name: String
    description: String
    rating: Int
    labels: [String!]
    aliases: [String!]
    avatar: String
    thumbnail: String
    altThumbnail: String
    hero: String
    favorite: Boolean
    bookmark: Long
    bornOn: Long
    customFields: Object
    nationality: String
    externalLinks: [ExternalLinkUpdateOpts!]
  }

  extend type Mutation {
    addActor(name: String!, aliases: [String!], labels: [String!]): Actor!
    updateActors(ids: [String!]!, opts: ActorUpdateOpts!): [Actor!]!
    removeActors(ids: [String!]!): Boolean!
    runActorPlugins(id: String!): Actor
    attachActorToUnmatchedScenes(id: String!): Actor
  }
`;
