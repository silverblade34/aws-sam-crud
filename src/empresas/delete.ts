import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, EMPRESAS_TABLE, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, notFoundResponse, badRequestResponse, internalErrorResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('ID de empresa es requerido');
    }

    const existingEmpresa = await dynamoDbClient.send(
      new GetCommand({
        TableName: EMPRESAS_TABLE,
        Key: { id },
      })
    );

    if (!existingEmpresa.Item) {
      return notFoundResponse('Empresa no encontrada');
    }

    const sedes = await dynamoDbClient.send(
      new QueryCommand({
        TableName: SEDES_TABLE,
        IndexName: 'EmpresaId-index',
        KeyConditionExpression: 'empresaId = :empresaId',
        FilterExpression: 'activo = :activo',
        ExpressionAttributeValues: {
          ':empresaId': id,
          ':activo': true,
        },
      })
    );

    if (sedes.Items && sedes.Items.length > 0) {
      return badRequestResponse('No se puede eliminar la empresa porque tiene sedes activas');
    }

    await dynamoDbClient.send(
      new UpdateCommand({
        TableName: EMPRESAS_TABLE,
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

    return successResponse(null, 'Empresa eliminada exitosamente');
  } catch (error) {
    console.error('Error deleting empresa:', error);
    return internalErrorResponse('Error al eliminar la empresa');
  }
};