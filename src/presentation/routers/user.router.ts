import { Router } from "express";
import { DatabaseError, validateRequest } from "@iagosrm/common";
import {
  userSerializer,
  getEmailValidator,
  getPasswordValidator,
  getUsernameValidator,
  getRoleValidator,
} from "@presentation";
import { IUserUseCase } from "@application";
import { User } from "@domain";

const usernameRequired = true;

export const makeUserRouter = (userUseCase: IUserUseCase) => {
  const { getAllUsers, getUser, insertUser, updateUser, deleteUser } =
    userUseCase;

  const userRouter = Router();

  userRouter.get("/", async (_, res, __) => {
    try {
      // TODO: pagination
      // console.log(req.query.limit, req.query.offset); /users?limit=10&offset=5
      const allUsers = await getAllUsers();
      res.status(200).json(allUsers);
    } catch {
      throw new DatabaseError();
    }
  });

  userRouter.get(
    "/:email",
    getEmailValidator("params"),
    validateRequest,
    async (req, res, _) => {
      const requestUser = userSerializer(req.params);
      let user: User | undefined = undefined;
      try {
        user = await getUser(requestUser.email);
      } catch {
        throw new DatabaseError();
      }

      if (!user)
        throw new DatabaseError(
          "User with that unique identifier not found",
          404
        );
      res.status(200).json({ user });
    }
  );

  userRouter.post(
    "/",
    getEmailValidator(),
    getPasswordValidator(),
    getUsernameValidator(usernameRequired),
    getRoleValidator(),
    validateRequest,
    async (req, res, _) => {
      const user = userSerializer(req.body);

      await insertUser(user);

      res.sendStatus(200);
    }
  );

  // allows to change only password
  userRouter.put(
    "/:email",
    getEmailValidator("params"),
    getPasswordValidator(),
    validateRequest,
    async (req, res, _) => {
      let reqBodyUser = userSerializer(req.body);
      let reqParamsUser = userSerializer(req.params);

      let user: User | undefined = undefined;
      try {
        user = await getUser(reqParamsUser.email);
        // throw new Error();
      } catch {
        throw new DatabaseError("There was a problem to get the user.");
      }

      if (user) {
        (user as User).password = reqBodyUser.password;
        try {
          await updateUser({
            email: reqParamsUser.email,
            password: reqBodyUser.password,
          });
          res.sendStatus(200);
        } catch {
          throw new DatabaseError("There was a problem to update the user.");
        }
      } else {
        throw new DatabaseError(
          "User with that unique identifier not found",
          404
        );
      }
    }
  );

  userRouter.delete(
    "/:email",
    getEmailValidator("params"),
    validateRequest,
    async (req, res) => {
      const user = userSerializer(req.params);

      const result = await deleteUser({
        email: user.email,
      });

      if (result) return res.sendStatus(200);
      throw new DatabaseError(
        "User with that unique identifier not found",
        404
      );
    }
  );

  return userRouter;
};
