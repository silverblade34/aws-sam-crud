import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, EMPRESAS_TABLE } from '../utils/dynamodb';
import { successResponse, internalErrorResponse } from '../utils/response';
import { ListResponse, Empresa } from '../types';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 50;
    const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey 
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastEvaluatedKey))
      : undefined;

    const result = await dynamoDbClient.send(
      new ScanCommand({
        TableName: EMPRESAS_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        FilterExpression: 'activo = :activo',
        ExpressionAttributeValues: {
          ':activo': true,
        },
      })
    );

    const response: ListResponse<Empresa> = {
      items: result.Items as Empresa[],
      count: result.Count || 0,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error listing empresas:', error);
    return internalErrorResponse('Error al listar las empresas');
  }
};