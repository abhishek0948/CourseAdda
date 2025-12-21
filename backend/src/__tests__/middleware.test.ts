// import { authenticate } from '../auth';
// import { authorize } from '../rbac';
// import { UserRole } from '../../types';
// import { Request, Response } from 'express';

// describe('Authentication Middleware', () => {
//   let mockRequest: Partial<Request>;
//   let mockResponse: Partial<Response>;
//   let nextFunction: jest.Mock;

//   beforeEach(() => {
//     mockRequest = {
//       headers: {},
//     };
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn().mockReturnThis(),
//     };
//     nextFunction = jest.fn();
//   });

//   it('should reject requests without authorization header', () => {
//     authenticate(mockRequest as any, mockResponse as Response, nextFunction);

//     expect(mockResponse.status).toHaveBeenCalledWith(401);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       error: 'Unauthorized: No token provided',
//     });
//     expect(nextFunction).not.toHaveBeenCalled();
//   });

//   it('should reject requests with invalid token format', () => {
//     mockRequest.headers = { authorization: 'InvalidToken' };

//     authenticate(mockRequest as any, mockResponse as Response, nextFunction);

//     expect(mockResponse.status).toHaveBeenCalledWith(401);
//     expect(nextFunction).not.toHaveBeenCalled();
//   });
// });

// describe('RBAC Middleware', () => {
//   let mockRequest: any;
//   let mockResponse: Partial<Response>;
//   let nextFunction: jest.Mock;

//   beforeEach(() => {
//     mockRequest = {
//       user: {
//         userId: 'test-id',
//         role: UserRole.STUDENT,
//         email: 'test@test.com',
//       },
//     };
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn().mockReturnThis(),
//     };
//     nextFunction = jest.fn();
//   });

//   it('should reject unauthorized user', async () => {
//     mockRequest.user = undefined;
//     const middleware = authorize(UserRole.ADMIN);

//     await middleware(mockRequest, mockResponse as Response, nextFunction);

//     expect(mockResponse.status).toHaveBeenCalledWith(401);
//     expect(nextFunction).not.toHaveBeenCalled();
//   });

//   it('should reject user with insufficient permissions', async () => {
//     mockRequest.user.role = UserRole.STUDENT;
//     const middleware = authorize(UserRole.ADMIN);

//     await middleware(mockRequest, mockResponse as Response, nextFunction);

//     expect(mockResponse.status).toHaveBeenCalledWith(403);
//     expect(nextFunction).not.toHaveBeenCalled();
//   });
// });
