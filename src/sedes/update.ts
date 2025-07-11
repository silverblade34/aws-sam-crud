import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, notFoundResponse, badRequestResponse, internalErrorResponse } from '../utils/response';
import { UpdateSedeRequest } from '../types';
import { validateUpdateSede } from '../utils/validation';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('ID de sede es requerido');
    }

    if (!event.body) {
      return badRequestResponse('Cuerpo de la petición es requerido');
    }

    const data: UpdateSedeRequest = JSON.parse(event.body);
    
    const validationErrors = validateUpdateSede(data);
    if (validationErrors.length > 0) {
      return badRequestResponse(validationErrors.join(', '));
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

    if (data.isPrincipal === true && !existingSede.Item.isPrincipal) {
      const existingPrincipal = await dynamoDbClient.send(
        new QueryCommand({
          TableName: SEDES_TABLE,
          IndexName: 'EmpresaId-IsPrincipal-index',
          KeyConditionExpression: 'empresaId = :empresaId AND isPrincipal = :isPrincipal',
          FilterExpression: 'activo = :activo',
          ExpressionAttributeValues: {
            ':empresaId': existingSede.Item.empresaId,
            ':isPrincipal': 'true',
            ':activo': true,
          },
        })
      );

      if (existingPrincipal.Items && existingPrincipal.Items.length > 0) {
        await dynamoDbClient.send(
          new UpdateCommand({
            TableName: SEDES_TABLE,
            Key: { id: existingPrincipal.Items[0].id },
            UpdateExpression: 'SET isPrincipal = :isPrincipal, #fechaActualizacion = :fechaActualizacion',
            ExpressionAttributeNames: {
              '#fechaActualizacion': 'fechaActualizacion',
            },
            ExpressionAttributeValues: {
              ':isPrincipal': false,
              ':fechaActualizacion': new Date().toISOString(),
            },
          })
        );
      }
    }

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.nombre !== undefined) {
      updateExpressions.push('#nombre = :nombre');
      expressionAttributeNames['#nombre'] = 'nombre';
      expressionAttributeValues[':nombre'] = data.nombre;
    }

    if (data.direccion !== undefined) {
      updateExpressions.push('#direccion = :direccion');
      expressionAttributeNames['#direccion'] = 'direccion';
      expressionAttributeValues[':direccion'] = data.direccion;
    }

    if (data.isPrincipal !== undefined) {
      updateExpressions.push('#isPrincipal = :isPrincipal');
      expressionAttributeNames['#isPrincipal'] = 'isPrincipal';
      expressionAttributeValues[':isPrincipal'] = data.isPrincipal;
    }

    if (data.activo !== undefined) {
      updateExpressions.push('#activo = :activo');
      expressionAttributeNames['#activo'] = 'activo';
      expressionAttributeValues[':activo'] = data.activo;
    }

    updateExpressions.push('#fechaActualizacion = :fechaActualizacion');
    expressionAttributeNames['#fechaActualizacion'] = 'fechaActualizacion';
    expressionAttributeValues[':fechaActualizacion'] = new Date().toISOString();

    if (updateExpressions.length === 1) { 
      return badRequestResponse('Debe proporcionar al menos un campo para actualizar');
    }

    const result = await dynamoDbClient.send(
      new UpdateCommand({
        TableName: SEDES_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return successResponse(result.Attributes, 'Sede actualizada exitosamente');
  } catch (error) {
    console.error('Error updating sede:', error);
    return internalErrorResponse('Error al actualizar la sede');
  }
};