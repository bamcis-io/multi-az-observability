#!/bin/bash

#if [[ "$1" == "build" ]]; then
#  docker buildx build --load "${@:2}"
#elif [[ "$1" == "run" ]]; then
#  docker buildx run "${@:2}"
#else
#  docker "$@"
#fi

export DOCKER_DEFAULT_PLATFORM="linux/arm64"
docker "$@"