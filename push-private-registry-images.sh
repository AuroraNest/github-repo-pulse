#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${REGISTRY:-docker.auroramaple.com}"
NAMESPACE="${NAMESPACE:-aurora}"
PLATFORM="${PLATFORM:-linux/amd64}"
VERSION="${1:-0.1.0}"

PROJECT_SLUG="${PROJECT_SLUG:-github-repo-pulse}"
WEB_IMAGE="${REGISTRY}/${NAMESPACE}/${PROJECT_SLUG}/web"

echo "${DOCKER_REGISTRY_PASSWORD:?DOCKER_REGISTRY_PASSWORD 未设置}" \
  | docker login "$REGISTRY" -u "${DOCKER_REGISTRY_USER:?DOCKER_REGISTRY_USER 未设置}" --password-stdin

docker buildx build \
  --platform "$PLATFORM" \
  -f Dockerfile.web \
  -t "${WEB_IMAGE}:${VERSION}" \
  -t "${WEB_IMAGE}:latest" \
  --push \
  .

echo "pushed ${WEB_IMAGE}:${VERSION}"
echo "pushed ${WEB_IMAGE}:latest"
