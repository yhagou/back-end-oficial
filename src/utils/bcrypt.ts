import * as bcrypt from 'bcrypt';

export async function encodePassword(password: string) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
