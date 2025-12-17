#!/bin/bash
export DATABASE_URL="file:./dev.db"
npx prisma migrate dev --name init
