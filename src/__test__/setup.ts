import { testContainer, Dependencies } from "../containers";
import { Application } from "../app";
import { Database } from "@infrastructure";

export const baseUrn = `/api/v1/users`;

export const testAppInstance: Application = testContainer.resolve(
  Dependencies.APP
) as Application;
export const testDbInstance: Database = testContainer.resolve(Dependencies.DB);

beforeAll(() => {
  return testAppInstance.start();
});

beforeEach(() => {
  return testDbInstance.deleteAll();
});

afterAll(() => {
  return testContainer.dispose();
});
