"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userResolvers_1 = __importDefault(require("./userResolvers"));
const todoResolvers_1 = __importDefault(require("./todoResolvers"));
const resolvers = {
    Query: { ...userResolvers_1.default.Query, ...todoResolvers_1.default.Query },
    Mutation: { ...userResolvers_1.default.Mutation, ...todoResolvers_1.default.Mutation },
};
exports.default = resolvers;
