import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";

interface IRequest {
  amount: number;
  description: string;
  sender_user_id: string;
  receiver_user_id: string;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    sender_user_id,
    receiver_user_id,
  }: IRequest): Promise<Statement> {
    const receiverUserExists = await this.usersRepository.findById(
      receiver_user_id
    );

    if (!receiverUserExists) {
      throw new CreateTransferError.UserNotFound();
    }

    const senderUserBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_user_id,
    });

    if (senderUserBalance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: receiver_user_id,
      sender_id: sender_user_id,
    });

    return statement;
  }
}

export { CreateTransferUseCase };
