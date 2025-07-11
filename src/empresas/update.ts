import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, EMPRESAS_TABLE } from '../utils/dynamodb';
import { successResponse, notFoundResponse, badRequestResponse, internalErrorResponse } from '../utils/response';
import { UpdateEmpresaRequest } from '../types';
import { validateUpdateEmpresa } from '../utils/validation';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('ID de empresa es requerido');
    }

    if (!event.body) {
      return badRequestResponse('Cuerpo de la petición es requerido');
    }

    const data: UpdateEmpresaRequest = JSON.parse(event.body);
    
    const validationErrors = validateUpdateEmpresa(data);
    if (validationErrors.length > 0) {
      return badRequestResponse(validationErrors.join(', '));
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

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.nombre !== undefined) {
      updateExpressions.push('#nombre = :nombre');
      expressionAttributeNames['#nombre'] = 'nombre';
      expressionAttributeValues[':nombre'] = data.nombre;
    }

    if (data.razonSocial !== undefined) {
      updateExpressions.push('#razonSocial = :razonSocial');
      expressionAttributeNames['#razonSocial'] = 'razonSocial';
      expressionAttributeValues[':razonSocial'] = data.razonSocial;
    }

    if (data.direccion !== undefined) {
      updateExpressions.push('#direccion = :direccion');
      expressionAttributeNames['#direccion'] = 'direccion';
      expressionAttributeValues[':direccion'] = data.direccion;
    }

    if (data.telefono !== undefined) {
      updateExpressions.push('#telefono = :telefono');
      expressionAttributeNames['#telefono'] = 'telefono';
      expressionAttributeValues[':telefono'] = data.telefono;
    }

    if (data.email !== undefined) {
      updateExpressions.push('#email = :email');
      expressionAttributeNames['#email'] = 'email';
      expressionAttributeValues[':email'] = data.email;
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
        TableName: EMPRESAS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return successResponse(result.Attributes, 'Empresa actualizada exitosamente');
  } catch (error) {
    console.error('Error updating empresa:', error);
    return internalErrorResponse('Error al actualizar la empresa');
  }
};