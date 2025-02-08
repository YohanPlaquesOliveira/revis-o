#!/bin/sh
set -e

# Aguardar o banco de dados estar pronto
echo "Waiting for database to be ready..."
./wait-for-it.sh $DB_HOST:5432 -t 60

# Executar migrações
echo "Running database migrations..."
yarn sequelize db:migrate

# Iniciar a aplicação
echo "Starting application..."
yarn start