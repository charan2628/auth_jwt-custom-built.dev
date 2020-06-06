#!/bin/bash

if [ "$(sudo docker network ls | grep "custom-built-net" | grep "bridge")" ]; then
    echo "Using existing custom-built-net network."
else
    sudo docker network create --driver bridge custom-built-net
fi

if [ "$(sudo docker container ls | grep "custom-built-mongodb")" ]; then
    echo "custom-built-mongodb already present using it."
else
    sudo docker run --rm -d \
    --network custom-built-net \
    --mount type=bind,src=${1},target=/data/db \
    --name custom-built-mongodb mongo:4.2
fi

if [ "$(sudo docker build --network custom-built-net -t auth_jwt:2.0 .)" ]; then
    sudo docker run --rm -d --network custom-built-net \
    -p 3000:3000 --name auth_jwt auth_jwt:2.0
else 
    echo "####### DOCKER BUILD FAILED ###########"
fi


