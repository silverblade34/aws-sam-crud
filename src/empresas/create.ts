import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDbClient, EMPRESAS_TABLE } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse, internalErrorResponse } from '../utils/response';
import { CreateEmpresaRequest, Empresa } from '../types';
import { validateCreateEmpresa } from '../utils/validation';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse('Cuerpo de la petición es requerido');
    }

    const data: CreateEmpresaRequest = JSON.parse(event.body);

    const validationErrors = validateCreateEmpresa(data);
    if (validationErrors.length > 0) {
      return badRequestResponse(validationErrors.join(', '));
    }

    const existingEmpresa = await dynamoDbClient.send(
      new QueryCommand({
        TableName: EMPRESAS_TABLE,
        IndexName: 'RUC-index',
        KeyConditionExpression: 'ruc = :ruc',
        ExpressionAttributeValues: {
          ':ruc': data.ruc,
        },
      })
    );

    if (existingEmpresa.Items && existingEmpresa.Items.length > 0) {
      return errorResponse(409, 'CONFLICT', 'Ya existe una empresa con este RUC');
    }

    const now = new Date().toISOString();
    const newEmpresa: Empresa = {
      id: uuidv4(),
      ruc: data.ruc,
      nombre: data.nombre,
      razonSocial: data.razonSocial,
      direccion: data.direccion,
      telefono: data.telefono,
      email: data.email,
      activo: true,
      fechaCreacion: now,
      fechaActualizacion: now,
    };

    await dynamoDbClient.send(
      new PutCommand({
        TableName: EMPRESAS_TABLE,
        Item: newEmpresa,
      })
    );

    return successResponse(newEmpresa, 'Empresa creada exitosamente');
  } catch (error) {
    console.error('Error creating empresa:', error);
    return internalErrorResponse('Error al crear la empresa');
  }
};