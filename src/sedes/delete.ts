import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, notFoundResponse, badRequestResponse, internalErrorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('ID de sede es requerido');
    }

    const existingSede = await dynamoDbClient.send(
      new GetCommand({
        TableName: SEDES_TABLE,
        Key: { id },
      })
    );

    if (!existingSede.Item) {
      return notFoundResponse('Sede no encontrada');
    }

    await dynamoDbClient.send(
      new UpdateCommand({
        TableName: SEDES_TABLE,
        Key: { id },
        UpdateExpression: 'SET #activo = :activo, #fechaActualizacion = :fechaActualizacion',
        ExpressionAttributeNames: {
          '#activo': 'activo',
          '#fechaActualizacion': 'fechaActualizacion',
        },
        ExpressionAttributeValues: {
          ':activo': false,
          ':fechaActualizacion': new Date().toISOString(),
        },
      })
    );

    return successResponse(null, 'Sede eliminada exitosamente');
  } catch (error) {
    console.error('Error deleting sede:', error);
    return internalErrorResponse('Error al eliminar la sede');
  }
};