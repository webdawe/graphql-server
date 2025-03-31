import { GraphQLError } from "graphql";
import { getCompany } from "./db/companies.js";
import { getJobs, getJob, getJobsByCompany, createJob } from "./db/jobs.js";
import { getUser } from "./db/users.js";

export const resolvers = {
  Query: {
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        return throwNotFoundError(`No Job found for id: ${id}`);
      }
      return job;
    },
    jobs: async () => await getJobs(),
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        return throwNotFoundError(`No Company found for id: ${id}`);
      }
      return company;
    },
  },
  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        return unAuthorizedError("Missing Authentication");
      }
      return createJob({ companyId: user.companyId, title, description });
    },
  },
  Job: {
    company: async (job, _args, { companyLoader }) =>
      await companyLoader.load(job.companyId),
    date: (job) => toISODate(job.createdAt),
  },
  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },
};
function toISODate(value) {
  return value.slice(0, "yyyy-mm-dd".length);
}

function throwNotFoundError(message) {
  return new GraphQLError(message, { extensions: { code: "NOT_FOUND" } });
}

function unAuthorizedError(message) {
  return new GraphQLError(message, { extensions: { code: "UNAUTHORIZED" } });
}
