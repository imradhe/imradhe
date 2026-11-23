.DEFAULT_GOAL := test
.PHONY: test build dev seed up down

test:
	npm run check
build:
	npm run build
dev:
	npm run dev
seed:
	npm run seed
up:
	docker compose up --build -d
	docker compose exec web npm run seed
down:
	docker compose down
