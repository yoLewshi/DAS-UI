#!/bin/bash -e

function install_das-ui_docker {
    echo Removing previous DAS-UI docker container and images
    sudo docker stop das-ui || true && sudo docker rm das-ui || true
    sudo docker network create --subnet=172.18.0.0/16 das-net || true
    sudo docker build -t openrvdas/das-ui-image -f dockerfile_das-ui .
    sudo docker run -d -p 80:3000 --restart=always --name=das-ui --net das-net --ip 172.18.0.7 openrvdas/das-ui-image
    sudo docker image prune --all -f --filter label=openrvdas="das-ui"
    sudo docker volume prune --all -f --filter label=openrvdas="das-ui"
}

install_das-ui_docker


echo "#########################################################################"
echo "Installation complete"
echo "DAS-UI server available at localhost:80"
echo