.PHONY: help up down build restart logs shell-backend shell-db migrate migrate-create test-backend lint format

DOCKER_COMPOSE = docker compose
BACKEND = $(DOCKER_COMPOSE) exec backend

## ─── Help ───────────────────────────────────────────────────────────────────
help: ## Show this help message
	@echo "╔═══════════════════════════════════════╗"
	@echo "║      RentHub Development Makefile     ║"
	@echo "╚═══════════════════════════════════════╝"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

## ─── Docker ─────────────────────────────────────────────────────────────────
up: ## Start all services in detached mode
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop all services and remove containers
	$(DOCKER_COMPOSE) down

build: ## Rebuild all Docker images without cache
	$(DOCKER_COMPOSE) build --no-cache

restart: ## Restart all services
	$(DOCKER_COMPOSE) restart

logs: ## Follow logs for all services
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Follow backend logs
	$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## Follow frontend logs
	$(DOCKER_COMPOSE) logs -f frontend

## ─── Database ───────────────────────────────────────────────────────────────
migrate: ## Run Alembic migrations
	$(BACKEND) alembic upgrade head

migrate-create: ## Create a new migration (use: make migrate-create MSG="your message")
	$(BACKEND) alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback one migration
	$(BACKEND) alembic downgrade -1

migrate-history: ## Show migration history
	$(BACKEND) alembic history --verbose

## ─── Shells ──────────────────────────────────────────────────────────────────
shell-backend: ## Open a shell in the backend container
	$(DOCKER_COMPOSE) exec backend bash

shell-db: ## Open a psql shell in the database container
	$(DOCKER_COMPOSE) exec db psql -U $${POSTGRES_USER:-renthub} -d $${POSTGRES_DB:-renthub}

shell-redis: ## Open a redis-cli shell
	$(DOCKER_COMPOSE) exec redis redis-cli -a $${REDIS_PASSWORD:-redis_secret}

## ─── Testing ─────────────────────────────────────────────────────────────────
test-backend: ## Run backend tests with coverage
	$(BACKEND) pytest tests/ -v --cov=app --cov-report=term-missing

## ─── Code Quality ────────────────────────────────────────────────────────────
lint: ## Run ruff linter
	$(BACKEND) ruff check app/

format: ## Format code with ruff
	$(BACKEND) ruff format app/

typecheck: ## Run mypy type checks
	$(BACKEND) mypy app/ --ignore-missing-imports

## ─── Setup ───────────────────────────────────────────────────────────────────
setup: ## Initial project setup (copy .env files)
	@cp -n .env.example .env 2>/dev/null || echo ".env already exists"
	@cp -n backend/.env.example backend/.env 2>/dev/null || echo "backend/.env already exists"
	@cp -n frontend/.env.example frontend/.env.local 2>/dev/null || echo "frontend/.env.local already exists"
	@echo "✅ Env files ready. Please fill in your secrets."

## ─── Clean ───────────────────────────────────────────────────────────────────
clean: ## Remove all containers, volumes, and images
	$(DOCKER_COMPOSE) down -v --rmi local
