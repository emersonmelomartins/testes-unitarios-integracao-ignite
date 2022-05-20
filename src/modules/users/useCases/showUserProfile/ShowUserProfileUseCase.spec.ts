import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { UsersRepository } from "../../repositories/UsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show existing user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Emerson M",
      email: "emerson@gmail.com",
      password: "1234",
    });

    const userProfile = await showUserProfileUseCase.execute(user.id!);

    expect(userProfile).toHaveProperty("id");
  });

  it("should not be able to show non-existing user profile", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("some_random_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
