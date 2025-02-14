export interface UserResponse {
  message: string;
  data?: {
    id: number;
    name: string;
    email: string;
    isTeacher: boolean;
  };
  error?: any;
}
