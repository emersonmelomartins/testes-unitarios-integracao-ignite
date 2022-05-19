import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get Balance", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let getBalanceUseCase: GetBalanceUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get user balance", async () => {
    const user = await createUserUseCase.execute({
      name: "Emerson M",
      email: "emerson1@gmail.com",
      password: "1234",
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id!,
    });

    expect(balance).toHaveProperty("balance");
  });

  it("should not be able to get non-existing user balance", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "any_id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
