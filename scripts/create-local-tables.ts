import AWS from 'aws-sdk';

// Configuración para DynamoDB local
const dynamodb = new AWS.DynamoDB({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy'
});

const createTables = async (): Promise<void> => {
  try {
    // Crear tabla de empresas
    const empresasTable: AWS.DynamoDB.CreateTableInput = {
      TableName: 'crud-sam-empresas',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'ruc', AttributeType: 'S' },
        { AttributeName: 'nombre', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'RUC-index',
          KeySchema: [
            { AttributeName: 'ruc', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'Nombre-index',
          KeySchema: [
            { AttributeName: 'nombre', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    await dynamodb.createTable(empresasTable).promise();

    // Crear tabla de sedes
    const sedesTable: AWS.DynamoDB.CreateTableInput = {
      TableName: 'crud-sam-sedes',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'empresaId', AttributeType: 'S' },
        { AttributeName: 'isPrincipal', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmpresaId-index',
          KeySchema: [
            { AttributeName: 'empresaId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'EmpresaId-IsPrincipal-index',
          KeySchema: [
            { AttributeName: 'empresaId', KeyType: 'HASH' },
            { AttributeName: 'isPrincipal', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    await dynamodb.createTable(sedesTable).promise();

    // Listar tablas para verificar
    const tables = await dynamodb.listTables().promise();
    console.log(tables.TableNames);

  } catch (error: any) {
    if (error.code === 'ResourceInUseException') {
      console.log('⚠️ Las tablas ya existen');
    } else {
      console.error('❌ Error creando tablas:', error);
    }
  }
};

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  createTables();
}