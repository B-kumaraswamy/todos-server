import userResolvers from "./userResolvers";
import todoResolvers from "./todoResolvers";

const resolvers = {
  Query: { ...userResolvers.Query, ...todoResolvers.Query },
  Mutation: { ...userResolvers.Mutation, ...todoResolvers.Mutation },
};

export default resolvers;
