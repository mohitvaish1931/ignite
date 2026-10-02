import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Project Organizer API')
    .setDescription('Enterprise Event Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.resolve(process.cwd(), 'swagger.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`Swagger spec generated successfully at ${outputPath}`);
  
  await app.close();
}

generateSwagger().catch(err => {
  console.error('Failed to generate Swagger spec', err);
  process.exit(1);
});
