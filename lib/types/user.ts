export type User = {
  id: string;
  username: string;
  /** Plain text for mock only; production would use a password hash. */
  password: string;
  fullName: string;
  createdAt: string;
  lastActive: string;
  isAdmin: boolean;
};
