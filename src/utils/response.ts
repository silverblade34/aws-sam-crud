import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types';

export const createResponse = (
  statusCode: number,
  body: ApiResponse
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    },
    body: JSON.stringify(body),
  };
};

export const successResponse = (data: any, message?: string): APIGatewayProxyResult => {
  return createResponse(200, {
    success: true,
    data,
    message,
  });
};

export const errorResponse = (
  statusCode: number,
  error: string,
  message?: string
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    error,
    message,
  });
};

export const notFoundResponse = (message = 'Recurso no encontrado'): APIGatewayProxyResult => {
  return errorResponse(404, 'NOT_FOUND', message);
};

export const badRequestResponse = (message = 'Datos inválidos'): APIGatewayProxyResult => {
  return errorResponse(400, 'BAD_REQUEST', message);
};

export const internalErrorResponse = (message = 'Error interno del servidor'): APIGatewayProxyResult => {
  return errorResponse(500, 'INTERNAL_ERROR', message);
};