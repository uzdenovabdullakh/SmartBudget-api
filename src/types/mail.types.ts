export interface MailData<T> {
  to: string;
  subject: string;
  payload: T;
  inviter?: string;
  userName?: string | null;
}
export interface MailOptions {
  email: string;
  token: string;
  userName?: string | null;
}
