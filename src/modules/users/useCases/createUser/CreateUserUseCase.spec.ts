import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should not be able to create a new user if email already exists", async () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        name: "Emerson 1",
        email: "emerson1@gmail.com",
        password: "1234",
      });

      await createUserUseCase.execute({
        name: "Emerson 1",
        email: "emerson1@gmail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Emerson 2",
      email: "emerson2@gmail.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });
});
