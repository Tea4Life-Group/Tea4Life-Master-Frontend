export default interface ApiResponse<T> {
  errorCode: number | null;
  errorMessage: string | null;
  data: T;
}
