import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

const typeDefs = `
enum Priority {
low
medium
high}


enum Status {
todo
in_progress
done}

type User {
id: ID!
auth0Id: String!
email: String!
name: String
picture: String
createdAt: String!
updatedAt: String!

}


type Todo {
id: ID!
title: String!
description: String!
priority: Priority!
status: Status!
dueDate: String
userId: String! 
createdAt: String!
updatedAt: String!}

input TodoInput {
title: String!
description: String!
priority: Priority
status: Status
dueDate: String

}

input TodoUpdateInput {
title: String
description: String
priority: Priority
status: Status
dueDate: String}

type Query {
me: User
todos : [Todo!]!
todo(id: ID!): Todo
todosByStatus(status: Status!): [Todo!]!
todosByPriority(priority: Priority!): [Todo!]!
}

type Mutation {
updateUser(name: String, picture: String): User
createTodo(input: TodoInput!): Todo
updateTodo(id: ID!, input: TodoUpdateInput!): Todo
deleteTodo(id: ID!): Todo
deleteCompletedTodos: Int!
}
`;

export default typeDefs;    
