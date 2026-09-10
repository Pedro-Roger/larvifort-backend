import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('aceita novo membro sem sobrenome', async () => {
    const dto = Object.assign(new CreateUserDto(), {
      firstName: 'Maria',
      lastName: '',
      email: 'maria@example.com',
      password: 'senha-segura',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).not.toContain('lastName');
  });
});
