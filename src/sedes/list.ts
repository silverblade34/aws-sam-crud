import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, internalErrorResponse } from '../utils/response';
import { ListResponse, Sede } from '../types';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 50;
    const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey 
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastEvaluatedKey))
      : undefined;

    const result = await dynamoDbClient.send(
      new ScanCommand({
        TableName: SEDES_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        FilterExpression: 'activo = :activo',
        ExpressionAttributeValues: {
          ':activo': true,
        },
      })
    );

    const response: ListResponse<Sede> = {
      items: result.Items as Sede[],
      count: result.Count || 0,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error listing sedes:', error);
    return internalErrorResponse('Error al listar las sedes');
  }
};