import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDbClient, EMPRESAS_TABLE, SEDES_TABLE } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse, internalErrorResponse } from '../utils/response';
import { CreateSedeRequest, Sede } from '../types';
import { validateCreateSede } from '../utils/validation';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse('Cuerpo de la petición es requerido');
    }

    const data: CreateSedeRequest = JSON.parse(event.body);
    
    const validationErrors = validateCreateSede(data);
    if (validationErrors.length > 0) {
      return badRequestResponse(validationErrors.join(', '));
    }

    const empresa = await dynamoDbClient.send(
      new GetCommand({
        TableName: EMPRESAS_TABLE,
        Key: { id: data.empresaId },
      })
    );

    if (!empresa.Item || !empresa.Item.activo) {
      return errorResponse(404, 'NOT_FOUND', 'Empresa no encontrada o inactiva');
    }

    if (data.isPrincipal) {
      const existingPrincipal = await dynamoDbClient.send(
        new QueryCommand({
          TableName: SEDES_TABLE,
          IndexName: 'EmpresaId-IsPrincipal-index',
          KeyConditionExpression: 'empresaId = :empresaId AND isPrincipal = :isPrincipal',
          FilterExpression: 'activo = :activo',
          ExpressionAttributeValues: {
            ':empresaId': data.empresaId,
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

    const now = new Date().toISOString();
    const newSede: Sede = {
      id: uuidv4(),
      empresaId: data.empresaId,
      nombre: data.nombre,
      direccion: data.direccion,
      isPrincipal: data.isPrincipal || false,
      activo: true,
      fechaCreacion: now,
      fechaActualizacion: now,
    };

    await dynamoDbClient.send(
      new PutCommand({
        TableName: SEDES_TABLE,
        Item: newSede,
      })
    );

    return successResponse(newSede, 'Sede creada exitosamente');
  } catch (error) {
    console.error('Error creating sede:', error);
    return internalErrorResponse('Error al crear la sede');
  }
};