import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, EMPRESAS_TABLE } from '../utils/dynamodb';
import { successResponse, notFoundResponse, badRequestResponse, internalErrorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('ID de empresa es requerido');
    }

    const result = await dynamoDbClient.send(
      new GetCommand({
        TableName: EMPRESAS_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return notFoundResponse('Empresa no encontrada');
    }

    return successResponse(result.Item);
  } catch (error) {
    console.error('Error getting empresa:', error);
    return internalErrorResponse('Error al obtener la empresa');
  }
};