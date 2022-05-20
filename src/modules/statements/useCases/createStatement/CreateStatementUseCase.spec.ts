import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statement", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to deposit to existing user", async () => {
    const user = await createUserUseCase.execute({
      name: "Emerson M",
      email: "emerson1@gmail.com",
      password: "1234",
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 123.45,
      description: "Incoming Payment",
      type: OperationType.DEPOSIT,
    });

    expect(result).toHaveProperty("id");
  });

  it("should be able withdraw from existing user with balance", async () => {
    const user = await createUserUseCase.execute({
      name: "Emerson M",
      email: "emerson2@gmail.com",
      password: "1234",
    });

    await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 1000,
      description: "Incoming Payment",
      type: OperationType.DEPOSIT,
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 500,
      description: "Buying something",
      type: OperationType.WITHDRAW,
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able withdraw from existing user with insufficient balance", async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "Emerson M",
        email: "emerson3@gmail.com",
        password: "1234",
      });

      await createStatementUseCase.execute({
        user_id: user.id!,
        amount: 123.45,
        description: "Buying something",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create statement with non-existent user", async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: "abc#@!",
        amount: 321,
        description: "Statement desc",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
