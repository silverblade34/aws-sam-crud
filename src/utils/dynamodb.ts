import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
});

export const dynamoDbClient = DynamoDBDocumentClient.from(client);

export const EMPRESAS_TABLE = process.env.EMPRESAS_TABLE || '';
export const SEDES_TABLE = process.env.SEDES_TABLE || '';