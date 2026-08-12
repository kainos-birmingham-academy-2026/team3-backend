#!/bin/sh
set -eu

# Dependencies and generated Prisma client are prepared at image build time.
npx prisma migrate deploy
npm run seed
npm run dev
