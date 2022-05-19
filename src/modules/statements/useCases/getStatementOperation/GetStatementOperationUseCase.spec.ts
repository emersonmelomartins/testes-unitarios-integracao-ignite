import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get Statement Operation", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get a statement operations", async () => {
    const user = await createUserUseCase.execute({
      name: "Emerson M",
      email: "emerson10@gmail.com",
      password: "1234",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 123.45,
      description: "Incoming Payment",
      type: OperationType.DEPOSIT,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    });

    expect(result).toBe(statement);
  });

  it("should not be able to get non-existent statement operations", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Emerson M",
        email: "emerson20@gmail.com",
        password: "1234",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "any_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should not be able to get non-existent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "any_user_id",
        statement_id: "any_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
