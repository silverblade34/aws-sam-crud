import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, notFoundResponse, badRequestResponse, internalErrorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('ID de sede es requerido');
    }

    const result = await dynamoDbClient.send(
      new GetCommand({
        TableName: SEDES_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return notFoundResponse('Sede no encontrada');
    }

    return successResponse(result.Item);
  } catch (error) {
    console.error('Error getting sede:', error);
    return internalErrorResponse('Error al obtener la sede');
  }
};