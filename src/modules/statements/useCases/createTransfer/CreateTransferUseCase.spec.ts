import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

describe("Create Transfer", () => {
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createTransferUseCase: CreateTransferUseCase;

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create transfer statement", async () => {
    const user1 = await inMemoryUsersRepository.create({
      name: "Emerson M",
      email: "emerson@gmail.com",
      password: "1234",
    });
    const user2 = await inMemoryUsersRepository.create({
      name: "Everton M",
      email: "everton@gmail.com",
      password: "1234",
    });

    await inMemoryStatementsRepository.create({
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "Deposit",
      user_id: user1.id!,
    });

    const result = await createTransferUseCase.execute({
      sender_user_id: user1.id!,
      receiver_user_id: user2.id!,
      amount: 50,
      description: "Transfer user1 to user2",
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to create transfer statement without funds", async () => {
    const user1 = await inMemoryUsersRepository.create({
      name: "Emerson M",
      email: "emerson@gmail.com",
      password: "1234",
    });
    const user2 = await inMemoryUsersRepository.create({
      name: "Everton M",
      email: "everton@gmail.com",
      password: "1234",
    });

   await expect(
    createTransferUseCase.execute({
      sender_user_id: user1.id!,
      receiver_user_id: user2.id!,
      amount: 50,
      description: "Transfer user1 to user2",
    })
    ).rejects.toEqual(new CreateTransferError.InsufficientFunds())
  });

  it("should not be able to create transfer statement for a non-existing user", async () => {
    const user1 = await inMemoryUsersRepository.create({
      name: "Emerson M",
      email: "emerson@gmail.com",
      password: "1234",
    });

    await inMemoryStatementsRepository.create({
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "Deposit",
      user_id: user1.id!,
    });

   await expect(
    createTransferUseCase.execute({
      sender_user_id: user1.id!,
      receiver_user_id: "some_random_id",
      amount: 50,
      description: "Transfer user1 to user2",
    })
    ).rejects.toEqual(new CreateTransferError.UserNotFound())
  });

});
