.DEFAULT_GOAL := test
.PHONY: test lint build smoke smoke-db

IMAGE ?= imradhe-com

# What CI runs: lint every PHP file, validate routes.json, then smoke-test the real image,
# with and without a database (smoke-db imports db/imradhe.sql into a throwaway MariaDB).
test: lint build smoke smoke-db

lint:
	docker run --rm -v "$(CURDIR)/src:/app:ro" -v "$(CURDIR)/tests:/tests:ro" php:8.3-cli sh /tests/lint.sh

build:
	docker build -t $(IMAGE) .

smoke:
	./tests/smoke.sh $(IMAGE)

smoke-db:
	./tests/smoke-db.sh $(IMAGE)
