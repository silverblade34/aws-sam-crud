import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, badRequestResponse, internalErrorResponse } from '../utils/response';
import { ListResponse, Sede } from '../types';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const empresaId = event.pathParameters?.empresaId;
    
    if (!empresaId) {
      return badRequestResponse('ID de empresa es requerido');
    }

    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 50;
    const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey 
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastEvaluatedKey))
      : undefined;

    const result = await dynamoDbClient.send(
      new QueryCommand({
        TableName: SEDES_TABLE,
        IndexName: 'EmpresaId-index',
        KeyConditionExpression: 'empresaId = :empresaId',
        FilterExpression: 'activo = :activo',
        ExpressionAttributeValues: {
          ':empresaId': empresaId,
          ':activo': true,
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    const response: ListResponse<Sede> = {
      items: result.Items as Sede[],
      count: result.Count || 0,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error listing sedes by empresa:', error);
    return internalErrorResponse('Error al listar las sedes de la empresa');
  }
};